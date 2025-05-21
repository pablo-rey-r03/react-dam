import { API_URL } from "../config";
import type Employee from "../model/Employee";
import type ErrorMessage from "../model/msg/ErrorMessage";

const EMPLOYEE_API = API_URL + "/employee";

export const getEmployeeById = async (id: number): Promise<Employee> => {
    const res = await fetch(`${EMPLOYEE_API}/${id}`, {
        method: "GET",
        headers: {
            authorization: "Bearer " + localStorage.getItem("token")
        }
    });

    if (!res.ok) {
        const error: ErrorMessage = await res.json();
        throw error;
    }

    return (await res.json()) as Employee;
}