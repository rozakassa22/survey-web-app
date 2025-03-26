"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Survey {
  id: string;
  title: string;
  questions: Question[];
  responses: Response[];
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  responses: Response[];
}

interface Response {
  id: string;
  text: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalSurveys: number;
  totalQuestions: number;
  totalResponses: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSurveys: 0,
    totalQuestions: 0,
    totalResponses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
        
        const userData = await res.json();
        
        // Check if the response has the correct structure
        if (!userData.success || !userData.data) {
          throw new Error("Invalid response format");
        }
        
        // Check if the user has admin role
        if (userData.data.role !== "ADMIN") {
          toast.error("Access denied. Redirecting to user dashboard...");
          router.push("/user");
          return;
        }
        
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error("Authentication failed. Please log in again.");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, surveysRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/surveys"),
        ]);

        if (!usersRes.ok || !surveysRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const usersData = await usersRes.json();
        const surveysData = await surveysRes.json();

        // Check if data has the expected structure and convert to array
        const usersArray = usersData.data || [];
        const surveysArray = surveysData.data || [];

        // Set state with arrays
        setUsers(usersArray);
        setSurveys(surveysArray);

        // Calculate stats using the arrays
        setStats({
          totalUsers: usersArray.length || 0,
          totalSurveys: surveysArray.length || 0,
          totalQuestions: surveysArray.reduce(
            (acc: number, survey: Survey) =>
              acc + (survey.questions?.length || 0),
            0
          ),
          totalResponses: surveysArray.reduce(
            (acc: number, survey: Survey) =>
              acc +
                survey.questions?.reduce(
                  (questionAcc: number, question: Question) =>
                    questionAcc + (question.responses?.length || 0),
                  0
                ) || 0,
            0
          ),
        });
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
        console.error(error);
      }
    };

    if (!loading) {
      fetchData();
    }
  }, [loading]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) throw new Error("Logout failed");

      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white shadow-sm dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end h-16">
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Admin Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ">
            <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6 dark:text-white dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-white truncate">
                  Total Users
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6 dark:text-white dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-white truncate">
                  Total Surveys
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalSurveys}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800">
              <div className="px-4 py-5 sm:p-6 dark:text-white dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-white truncate">
                  Total Questions
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalQuestions}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800 ">
              <div className="px-4 py-5 sm:p-6 dark:text-white dark:bg-gray-800 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-white  truncate">
                  Total Responses
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalResponses}
                </dd>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mb-8 dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6 dark:text-white dark:bg-gray-800 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Users
              </h2>
              <div className="overflow-x-auto dark:text-white dark:bg-gray-800 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:text-white dark:bg-gray-800 rounded-lg">
                  <thead className="bg-gray-50 dark:text-white dark:bg-gray-800 rounded-lg">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:text-white dark:bg-gray-800 rounded-lg">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6 dark:text-white dark:bg-gray-800 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Surveys
              </h2>
              <div className="space-y-6">
                {surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="border rounded-lg p-4 dark:text-white dark:bg-gray-800 rounded-lg"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
                      {survey.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 dark:text-white">
                      Created: {new Date(survey.createdAt).toLocaleDateString()} |
                      Questions: {survey.questions?.length || 0} | Total
                      Responses:{" "}
                      {survey.questions?.reduce(
                        (acc: number, question: Question) =>
                          acc + (question.responses?.length || 0),
                        0
                      ) || 0}
                    </p>
                    <div className="space-y-4">
                      {survey.questions?.map((question) => (
                        <div key={question.id} className="ml-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-white">
                            - {question.text}
                          </p>
                          <div className="mt-2 space-y-2">
                            {question.responses?.map((response) => (
                              <div
                                key={response.id}
                                className="ml-4 text-sm text-gray-500"
                              >
                                <p className="font-medium">Response:</p>
                                <p>{response.text}</p>
                                <p className="text-xs text-gray-400">
                                  Submitted:{" "}
                                  {new Date(
                                    response.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
