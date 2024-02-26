interface String {
    replaceTolgeeFormat(): string;
}

String.prototype.replaceTolgeeFormat = function () {
    return this.replaceAll("%", "").replaceAll("(%", "(").replaceAll("#%", "#");
};
