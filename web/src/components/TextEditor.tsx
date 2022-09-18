import React from "react";
import { useDispatch } from "react-redux";

export const TextEditor = ({}) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");

  return (
    <div>
      <input
        type="textarea"
        name="textValue"
        onChange={e => setInput(e.target.value)}
      />
    </div>
  );
};
