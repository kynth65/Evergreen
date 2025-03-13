import React from "react";
import { Link } from "react-router-dom";
import { Card, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

const ProfileCard = ({ profileData }) => {
  // Format full name
  const getFullName = () => {
    if (!profileData) return "User";

    let fullName = profileData.first_name || "";
    if (profileData.middle_initial)
      fullName += ` ${profileData.middle_initial}.`;
    if (profileData.last_name) fullName += ` ${profileData.last_name}`;

    return fullName || "User";
  };

  // Generate random colors for avatar based on user ID or name
  const getRandomAvatarColors = () => {
    if (!profileData) return "linear-gradient(to right, #1da57a, #52c41a)";

    // Use user ID or name as seed for consistent colors for the same user
    const seed = profileData.id || getFullName() || "default";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate 2 colors for gradient
    const color1 = `hsl(${hash % 360}, 70%, 60%)`;
    const color2 = `hsl(${(hash + 40) % 360}, 70%, 50%)`;

    return `linear-gradient(to right, ${color1}, ${color2})`;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!profileData) return "U";

    let initials = profileData.first_name ? profileData.first_name[0] : "";
    if (profileData.last_name) initials += profileData.last_name[0];

    return initials.toUpperCase() || "U";
  };

  return (
    <Card style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: getRandomAvatarColors(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
            marginRight: "16px",
          }}
        >
          {getUserInitials()}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px" }}>{getFullName()}</h3>
          <p style={{ margin: 0, color: "#888" }}>
            {profileData?.role
              ? profileData.role.charAt(0).toUpperCase() +
                profileData.role.slice(1)
              : "Intern"}
          </p>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "12px",
              color: "#888",
            }}
          >
            {profileData?.email}
          </p>
        </div>
      </div>
      <div style={{ marginTop: "16px" }}>
        <Link to="/intern/profile">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            style={{ width: "100%" }}
          >
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ProfileCard;
