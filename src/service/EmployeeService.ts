import { API_URL } from "../config";
import type EmployeeDTO from "../model/dto/EmployeeDTO";
import type Employee from "../model/Employee";
import type ErrorMessage from "../model/msg/ErrorMessage";
import type ResponseEntity from "../model/msg/ResponseEntity";

const EMPLOYEE_API = API_URL + "/employee";

export const getEmployeeById = async (id: number): Promise<Employee> => {
    const res = await fetch(`${EMPLOYEE_API}/${id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-type": "application/json"
        }
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as Employee;
}

export const updateEmployee = async (id: number, data: EmployeeDTO): Promise<ResponseEntity<Employee>> => {
    const res = await fetch(`${EMPLOYEE_API}/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-type": "application/json"
        },
        body: JSON.stringify({ ...data, active: true })
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as ResponseEntity<Employee>;
}