import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.TypedRule {
    public static FAILURE_STRING = "yield result should be typed if result is used: (__EXPRESSION__) as 'ResultType'";
    public static PARENT_TYPES_SHOULD_ANALYSED = [
        ts.SyntaxKind.PropertyAccessExpression, // (yield i).a
        ts.SyntaxKind.VariableStatement, // var a = yield i
        ts.SyntaxKind.BinaryExpression // a.b = yield i
    ];

    public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
        const checker = program.getTypeChecker();

        // We convert the `ruleArguments` into a useful format before passing it to the constructor of AbstractWalker.
        return this.applyWithWalker(new StrictYieldTypeWalker(checker, sourceFile, this.ruleName, new Set(this.ruleArguments.map(String))));
    }
}

class StrictYieldTypeWalker extends Lint.AbstractWalker<Set<string>> {
    private readonly checker: ts.TypeChecker;

    constructor(checker: ts.TypeChecker, sourceFile: ts.SourceFile, ruleName: string, options: Set<string>) {
        super(sourceFile, ruleName, options);

        this.checker = checker;
    }

    public walk(sourceFile: ts.SourceFile) {
        const cb = (node: ts.Node): void => {
            // Finds specific node types and do checking.
            if (node.kind === ts.SyntaxKind.YieldExpression) {
                this.checkYieldExpression(node);
            } else {
                // Continue recursion: call function `cb` for all children of the current node.
                return ts.forEachChild(node, cb);
            }
        };

        // Start recursion for all children of `sourceFile`.
        return ts.forEachChild(sourceFile, cb);
    }

    private checkYieldExpression(node: ts.Node) {
        let isParentNodeExist = node.parent && node.parent.parent;

        if(isParentNodeExist && this.checkParentType(node) && !this.validateAsExpression(node.parent.parent, node)) {
            this.addFailureAtNode(node, Rule.FAILURE_STRING.replace('__EXPRESSION__', node.getText()));
        }
    }

    //Checking a parent node if need to analyse
    private checkParentType(node: ts.Node) : boolean {
        if(Rule.PARENT_TYPES_SHOULD_ANALYSED.indexOf(node.kind) >= 0) {
            return true;
        }

        if(node.kind === ts.SyntaxKind.Block || !node.parent) {
            return false;
        }

        return this.checkParentType(node.parent);
    }

    //Checking AsExpression, should be as: (yield call()) as ResultType 
    private validateAsExpression(node: ts.Node, yieldExpression: ts.Node) : boolean {
        let children = node.getChildren();

        const result = children.length === 3 &&
            children[0].kind === ts.SyntaxKind.ParenthesizedExpression && // yield should be parenthesized
            children[1].kind === ts.SyntaxKind.AsKeyword && // should be 'as' between 
            children[2].kind !== ts.SyntaxKind.AnyKeyword; // Any is not allowed

        if(result) {
            const castType = this.checker.getTypeAtLocation(children[2]);
            let yieldType = yieldExpression.getChildCount() > 0 && this.checker.getTypeAtLocation(yieldExpression.getChildAt(1));

            yieldType = this.checker['getPromisedTypeOfPromise'](yieldType) || yieldType;

            if(yieldType !== castType) {
                const error = "yield return type '" + this.checker.typeToString(yieldType) + "' is not equal to " +
                    "casting type '" + this.checker.typeToString(castType) + "'";

                this.addFailureAtNode(node, error);
            }
        }

        return result;
    }
}