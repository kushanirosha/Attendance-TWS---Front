import { Key, ReactNode } from "react";

export interface Employee {
  gender: ReactNode;
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  department: string;
  project: string;
  profileImage?: string;
}

export interface Attendance {
  name: ReactNode;
  id: Key | null | undefined;
  employeeId: string;
  checkInTime: string;
  shift: 'Morning' | 'Noon' | 'Night';
  status: 'On time' | 'Late' | 'Absent' | 'Half day';
}

export interface Project {
  id: string;
  name: string;
  department: string;
  employees: { id: string }[]; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

export interface ShiftAssignments {
  [yearMonth: string]: {
    [employeeId: string]: {
      [day: string]: 'A' | 'B' | 'C' | 'RD';
    };
  };
}

export interface DummyData {
  employees: Employee[];
  attendance: Attendance[];
  projects: Project[];
  users: User[];
  shiftAssignments: ShiftAssignments;
}

export type TabType = 'dashboard' | 'employees' | 'shiftAssign' | 'users';
export type ShiftType = 'Morning' | 'Noon' | 'Night';
