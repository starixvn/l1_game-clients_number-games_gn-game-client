interface String {
    replaceTolgeeFormat(): string;
    capitalizeFirstLetter(): string;
    insertSpaceCapitalLetters(): string;
}

String.prototype.replaceTolgeeFormat = function () {
    return this.replaceAll("%", "").replaceAll("(%", "(").replaceAll("#%", "#");
};
String.prototype.capitalizeFirstLetter = function () {
    const regex = /(^|\s)[a-z]/g;
    return this.toLowerCase().replace(regex, (letter) => letter.toUpperCase());
};

String.prototype.insertSpaceCapitalLetters = function () {
    return this.replace(/([A-Z])/g, " $1").trim();
};
