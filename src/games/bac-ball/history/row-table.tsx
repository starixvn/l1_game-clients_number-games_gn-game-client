import { randomBytes } from "crypto";
import { FC } from "react";

interface TableRowProps {
    children?: ConfigRow[];
    isHeader?: boolean;
}

export interface ConfigRow {
    node?: React.ReactNode;
    size: number;
}

const TableRow: FC<TableRowProps> = ({ children, isHeader }) => {
    const sum = children.reduce((acc, item) => acc + item.size, 0);
    const elementSize = (100 / sum) * 0.8;
    return (
        <tr>
            {isHeader
                ? children.map((item, index) => (
                      <th key={randomBytes(10).toString()} style={{ width: `${elementSize * item.size}%` }}>
                          {item.node}
                      </th>
                  ))
                : children.map((item, index) => (
                      <td key={randomBytes(10).toString()} style={{ width: `${elementSize * item.size}%` }}>
                          {item.node}
                      </td>
                  ))}
        </tr>
    );
};

export default TableRow;
