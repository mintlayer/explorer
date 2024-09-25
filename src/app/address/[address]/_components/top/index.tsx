import styles from "./styles.module.css";

export const Top = ({ title, data }: any) => {
  return (
    <div className={styles.top}>
      <div className={styles.title}>{title}</div>
      <div className={styles.data}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.col_rank}>#</th>
              <th className={styles.col_address}>Address</th>
              <th className={styles.col_amount}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: number) => (
              <tr key={index}>
                <td className={styles.col_rank}>{index + 1}</td>
                <td className={styles.col_address}>{item.address}</td>
                <td className={styles.col_amount}>{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
