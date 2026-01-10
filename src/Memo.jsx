import React, { useEffect, useState, useMemo } from "react";

const Memo = () => {
  const [cnt, setCnt] = useState(0);
  const [flag, setFlag] = useState(false);

  const slowFunction = (cnt) => {
    let res = 0;
    for(let i = 0; i < 1000000000; i++) {
      res += cnt;
    }
    return res;
  };

  const computed = useMemo(() => slowFunction(cnt), [cnt]);

  useEffect(() => {
    console.log("Count udated:", cnt);
  }, [cnt]);

  useEffect(() => {
    console.log("Flag updated:", flag);
  }, [flag]);

  return (
    <div>
      <h1>{computed}</h1>
      <button onClick={() => setCnt(cnt + 1)}>Increment</button>
      <button onClick={() => setFlag(!flag)}>Toggle</button>
    </div>
  );
};

export default Memo;
