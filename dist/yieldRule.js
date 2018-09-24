"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new StrictYieldTypeWalker(sourceFile, this.ruleName, new Set(this.ruleArguments.map(String))));
    };
    Rule.FAILURE_STRING = "yield result should be typed if result is used: (__EXPRESSION__) as 'ResultType'";
    Rule.PARENT_TYPES_SHOULD_ANALYSED = [
        ts.SyntaxKind.PropertyAccessExpression,
        ts.SyntaxKind.VariableStatement,
        ts.SyntaxKind.BinaryExpression
    ];
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var StrictYieldTypeWalker = (function (_super) {
    __extends(StrictYieldTypeWalker, _super);
    function StrictYieldTypeWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
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
        if (isParentNodeExist && this.checkParentType(node) && !StrictYieldTypeWalker.validateAsExpression(node.parent.parent)) {
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
    StrictYieldTypeWalker.validateAsExpression = function (node) {
        var children = node.getChildren();
        return children.length === 3 &&
            children[0].kind === ts.SyntaxKind.ParenthesizedExpression &&
            children[1].kind === ts.SyntaxKind.AsKeyword &&
            children[2].kind !== ts.SyntaxKind.AnyKeyword;
    };
    return StrictYieldTypeWalker;
}(Lint.AbstractWalker));
