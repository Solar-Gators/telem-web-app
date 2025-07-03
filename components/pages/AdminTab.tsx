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

interface AdminTabProps {}

export default function AdminTab({}: AdminTabProps) {
  const [users, setUsers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newIsVerified, setNewIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      console.log("Starting to load users from AdminTab via API...");
      setLoading(true);
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        console.log("Fetched users via API:", data);
        if (data.users) {
          setUsers(data.users);
        } else {
          console.error("API error:", data.error);
          setUsers(null);
        }
      } catch (error) {
        console.error("Error in loadUsers via API:", error);
        setUsers(null);
      }
      setLoading(false);
    };
    loadUsers();
  }, []);

  const handleEdit = (userId: string) => {
    if (!users) return;
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setSelectedUserId(userId);
    setNewIsVerified(user.is_verified);
    setShowEditDialog(true);
  };
  const handleEditConfirm = async () => {
    if (!users || selectedUserId === null || newIsVerified === null) return;
    const user = users.find((u) => u.id === selectedUserId);
    if (!user) return;

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedUserId,
          name: user.name || "",
          email: user.email || "",
          is_verified: newIsVerified,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("User updated:", data.user);
        // Refresh user list
        const refreshedResponse = await fetch("/api/users");
        const refreshedData = await refreshedResponse.json();
        if (refreshedData.users) {
          setUsers(refreshedData.users);
        }
      } else {
        console.error("Failed to update user:", data.error, data.details);
        alert(`Failed to update user: ${data.error} - ${data.details}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred while updating the user.");
    } finally {
      setShowEditDialog(false);
      setSelectedUserId(null);
      setNewIsVerified(null);
    }
  };

  const handleDelete = (userId: string) => {
    if (!users) return;
    setSelectedUserId(userId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!users || selectedUserId === null) return;
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedUserId }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("User deleted successfully");
        // Refresh user list
        const refreshedResponse = await fetch("/api/users");
        const refreshedData = await refreshedResponse.json();
        if (refreshedData.users) {
          setUsers(refreshedData.users);
        }
      } else {
        console.error("Failed to delete user:", data.error, data.details);
        alert(`Failed to delete user: ${data.error} - ${data.details}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    } finally {
      setShowDeleteDialog(false);
      setSelectedUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Manage user data and system settings
          </CardDescription>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const loadUsers = async () => {
                  console.log("Refreshing user data...");
                  setLoading(true);
                  try {
                    const response = await fetch("/api/users");
                    const data = await response.json();
                    console.log("Fetched users via API:", data);
                    if (data.users) {
                      setUsers(data.users);
                    } else {
                      console.error("API error:", data.error);
                      setUsers(null);
                    }
                  } catch (error) {
                    console.error("Error in loadUsers via API:", error);
                    setUsers(null);
                  }
                  setLoading(false);
                };
                loadUsers();
              }}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              <p className="text-muted-foreground">Loading user data...</p>
              {console.log("usersssssssssss", users)}
            </>
          ) : users && users.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email || "N/A"}</TableCell>
                      <TableCell>{user.name || "N/A"}</TableCell>
                      <TableCell>{user.is_verified ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <AlertDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Edit User Verification</AlertDialogTitle>
                    <AlertDialogDescription>
                      Update the verification status for this user.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex space-x-4">
                    <Button
                      variant={newIsVerified === true ? "default" : "outline"}
                      onClick={() => setNewIsVerified(true)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={newIsVerified === false ? "default" : "outline"}
                      onClick={() => setNewIsVerified(false)}
                    >
                      No
                    </Button>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEditConfirm}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this user? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <p className="text-muted-foreground">
              No users found in the database.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
