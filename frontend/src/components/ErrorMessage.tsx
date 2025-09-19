import React from "react";

interface Props {
  message: string;
}

export const ErrorMessage: React.FC<Props> = ({ message }) => (
  <div className="text-red-500 mb-3 text-center">{message}</div>
);
