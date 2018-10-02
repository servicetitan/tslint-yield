"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        var checker = program.getTypeChecker();
        return this.applyWithWalker(new StrictYieldTypeWalker(checker, sourceFile, this.ruleName, new Set(this.ruleArguments.map(String))));
    };
    Rule.FAILURE_STRING = "yield result should be typed if result is used: (__EXPRESSION__) as 'ResultType'";
    Rule.PARENT_TYPES_SHOULD_ANALYSED = [
        ts.SyntaxKind.PropertyAccessExpression,
        ts.SyntaxKind.VariableStatement,
        ts.SyntaxKind.BinaryExpression
    ];
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var StrictYieldTypeWalker = (function (_super) {
    __extends(StrictYieldTypeWalker, _super);
    function StrictYieldTypeWalker(checker, sourceFile, ruleName, options) {
        var _this = _super.call(this, sourceFile, ruleName, options) || this;
        _this.checker = checker;
        return _this;
    }
    StrictYieldTypeWalker.prototype.walk = function (sourceFile) {
        var _this = this;
        var cb = function (node) {
            if (node.kind === ts.SyntaxKind.YieldExpression) {
                _this.checkYieldExpression(node);
            }
            else {
                return ts.forEachChild(node, cb);
            }
        };
        return ts.forEachChild(sourceFile, cb);
    };
    StrictYieldTypeWalker.prototype.checkYieldExpression = function (node) {
        var isParentNodeExist = node.parent && node.parent.parent;
        if (isParentNodeExist && this.checkParentType(node) && !this.validateAsExpression(node.parent.parent, node)) {
            this.addFailureAtNode(node, Rule.FAILURE_STRING.replace('__EXPRESSION__', node.getText()));
        }
    };
    StrictYieldTypeWalker.prototype.checkParentType = function (node) {
        if (Rule.PARENT_TYPES_SHOULD_ANALYSED.indexOf(node.kind) >= 0) {
            return true;
        }
        if (node.kind === ts.SyntaxKind.Block || !node.parent) {
            return false;
        }
        return this.checkParentType(node.parent);
    };
    StrictYieldTypeWalker.prototype.validateAsExpression = function (node, yieldExpression) {
        var children = node.getChildren();
        var result = children.length === 3 &&
            children[0].kind === ts.SyntaxKind.ParenthesizedExpression &&
            children[1].kind === ts.SyntaxKind.AsKeyword &&
            children[2].kind !== ts.SyntaxKind.AnyKeyword;
        if (result) {
            var castType = this.checker.getTypeAtLocation(children[2]);
            var yieldType = yieldExpression.getChildCount() > 0 && this.checker.getTypeAtLocation(yieldExpression.getChildAt(1));
            yieldType = this.checker['getPromisedTypeOfPromise'](yieldType) || yieldType;
            this.addFailureAtNode(node, "yield type: " + this.checker.typeToString(yieldType) + ', ' +
                "cast type: " + this.checker.typeToString(castType) + ', ' +
                "Is equal: " + (yieldType == castType));
        }
        return true;
    };
    return StrictYieldTypeWalker;
}(Lint.AbstractWalker));
