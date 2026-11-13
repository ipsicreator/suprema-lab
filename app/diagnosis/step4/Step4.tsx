"use client";

import ReportComponent from "../report";
import type { ComponentProps } from "react";
type ReportProps = ComponentProps<typeof ReportComponent>;

interface Step4Props {
  evaluated: ReportProps["results"];
  userInfo: ReportProps["studentInfo"];
  onReset: () => void;
}

export default function Step4({ evaluated, userInfo, onReset }: Step4Props) {
  return (
    <ReportComponent 
      results={evaluated} 
      studentInfo={userInfo} 
      onReset={onReset} 
    />
  );
}
