import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { query, where, getDocs, collection } from "firebase/firestore";
import { db } from "../../src/config/firebase"; // Import Firestore instance

export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/"); // Redirect to login if email is not available
      return;
    }

    const fetchUserData = async () => {
      try {
        // Create a query to find the document where the email field matches
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there's only one document with the email
          const docData = querySnapshot.docs[0].data();
          setUserData(docData);
        } else {
          setError("No user data found");
        }
      } catch (error) {
        setError("Error fetching user data");
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email, navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      {userData ? (
        <div>
          <p>Logged in as: {email}</p>
          <p>First Name: {userData.firstname}</p>
          <p>Last Name: {userData.lastname}</p>
        </div>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
}
