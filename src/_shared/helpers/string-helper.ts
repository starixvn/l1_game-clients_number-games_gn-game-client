interface String {
    replaceTogleeFormat(): string;
}

String.prototype.replaceTogleeFormat = function () {
    return this.replace("%", "").replace("(%", "(").replace("#%", "#");
};
