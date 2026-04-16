import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard title", () => {
  render(<App />);
  expect(screen.getByText(/Jira Lite Anime Dashboard/i)).toBeInTheDocument();
});
