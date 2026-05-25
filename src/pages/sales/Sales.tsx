import "./sales.css";
import { useEffect, useState } from "react";
import { getSales } from "./sales.service";

export default function Sales() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getSales().then((res) => setData(res.data));
  }, []);

  return (
    <div className="sales-container">
      <h1>Sales</h1>

      <table>
        <thead>
          <tr>
            <th>Shop</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.shop}</td>
              <td>{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}