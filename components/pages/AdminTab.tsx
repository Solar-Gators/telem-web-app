"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { fetchUsers } from "@/lib/db-utils";

export default function AdminTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (data.users) {
          setUsers(data.users);
        } else {
          console.log("No users retrieved");
          setUsers([]);
        }
      } catch (error) {
        console.log("Failed to retrieve users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  //   const handleEdit = (userID: string): void => {
  //     if (!users) return;
  //     const user = users.find((user) => user.id === userID);
  //     if (!user) return;

  //     setSelectedUserId(userID);
  //     setIsVerified(user.is_verified);
  //   };

  const handleToggleVerify = async (userID: string): Promise<void> => {
    const user = users.find((u) => u.id === userID);
    if (!user) return;

    const newStatus = !user.isVerified;

    try {
      const response = await fetch(`/api/users/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_verified: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        const refreshedResponse = await fetch("/api/users");
        const refreshedData = await refreshedResponse.json();
        if (refreshedData.users) {
          setUsers(refreshedData.users);
        }
      } else {
        console.log("failed to update user");
      }
    } catch (error) {
      console.error("Error updating user", error);
    } finally {
      setSelectedUserId(null);
      setIsVerified(null);
    }
  };
  const handleDelete = async (userID: string) => {
    try {
      const response = await fetch(`/api/users/${userID}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const refreshedResponse = await fetch("/api/users");
        const refreshedData = await refreshedResponse.json();
        if (refreshedData.users) {
          setUsers(refreshedData.users);
        } else {
          console.error("Failed to delete user");
        }
      }
    } catch (error) {
      console.error("Unable to delete User", error);
    }
  };
}
