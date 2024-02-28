export function toFlattenColumns<T>(rows: T[][]): T[] {
    const result = {};

    rows.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
            if (result[columnIndex]) {
                result[columnIndex][rowIndex] = cell;
            } else {
                result[columnIndex] = { [rowIndex]: cell };
            }
        });
    });

    return Object.values(result).flatMap((data) => Object.values(data));
}
