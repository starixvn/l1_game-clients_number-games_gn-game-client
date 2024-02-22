interface String {
    replaceTogleeFormat(): string;
}

String.prototype.replaceTogleeFormat = function () {
    return this.replaceAll("%", "").replaceAll("(%", "(").replaceAll("#%", "#");
};
