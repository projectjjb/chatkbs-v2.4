import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // 학교 관리형 크롬북처럼 오래된 브라우저에서도 실행되도록 타겟을 넓게 잡는다.
    target: "es2018",
  },
});
