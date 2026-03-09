// ==================== MARS COLONIZATION INITIATIVE ====================
// Main JavaScript File - All functionality in one place

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", function () {
  // Create default admin account if it doesn't exist
  createDefaultAdmin();

  initializeSignupForm();
  initializeLoginForm();
  initializeProfilePage();
  initializeSettingsPage();
  initializeLogout();
  initializeManageUsers();
});

// ==================== CREATE DEFAULT ADMIN ====================
function createDefaultAdmin() {
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const manageUsers = JSON.parse(localStorage.getItem("manageUsers")) || [];

  const adminEmail = "marsinitiative@admin.com";
  const adminExists = users.some((user) => user.email === adminEmail);

  if (!adminExists) {
    // Create admin user
    const adminUser = {
      id: 1, // First user
      fullname: "Mission Commander",
      name: "Mission Commander",
      email: adminEmail,
      password: "@mars1234",
      role: "Commander",
      registeredDate: new Date().toISOString(),
    };

    users.push(adminUser);
    localStorage.setItem("registeredUsers", JSON.stringify(users));

    // Also add to manageUsers
    const adminManageUser = {
      id: 1,
      name: "Mission Commander",
      email: adminEmail,
      role: "Commander",
    };

    manageUsers.push(adminManageUser);
    localStorage.setItem("manageUsers", JSON.stringify(manageUsers));

    console.log("Default admin account created");
  }
}

// ==================== PROFILE PAGE ====================
function initializeProfilePage() {
  const profilePage = document.querySelector(".dashboard-main");
  if (!profilePage) return;

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userEmail = localStorage.getItem("userEmail");
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const currentUser = users.find((user) => user.email === userEmail);

  if (!isLoggedIn || !currentUser) {
    showNotification("Please login first", "error");
    setTimeout(() => (window.location.href = "login.html"), 2000);
    return;
  }

  updateProfileDisplay(currentUser);
}

function updateProfileDisplay(user) {
  const profileName = document.querySelector(".profile-name");
  const profileEmail = document.querySelector(".profile-email");
  if (profileName) profileName.textContent = user.fullname || "Astronaut Name";
  if (profileEmail)
    profileEmail.textContent = user.email || "email@marscolony.space";

  const aboutText = document.querySelector(".about-text");
  if (aboutText) {
    let roleText = getRoleDisplay(user.role);
    aboutText.innerHTML = `Hi!✨ I am ${user.fullname.split(" ")[0]}, a ${roleText} with the Mars Colony. ${user.departure ? `Expected departure: ${user.departure}.` : ""} Proud member of humanity's greatest adventure!`;
  }

  const missionId = document.getElementById("mission-id");
  if (missionId) {
    const id =
      "MC-" +
      Math.floor(Math.random() * 10000) +
      "-" +
      user.email.substring(0, 2).toUpperCase();
    missionId.textContent = id;
  }

  const userRole = document.getElementById("user-role");
  const userDeparture = document.getElementById("user-departure");
  if (userRole)
    userRole.textContent = getRoleDisplay(user.role) || "Not specified";
  if (userDeparture)
    userDeparture.textContent =
      getDepartureDisplay(user.departure) || "Not specified";

  const currentDate = document.getElementById("current-date");
  if (currentDate)
    currentDate.textContent = `Sol ${Math.floor(Math.random() * 1000 + 1000)}`;

  if (user.registeredDate && !document.getElementById("reg-section")) {
    const profileSections = document.querySelector(".profile-sections");
    if (profileSections) {
      const regSection = document.createElement("section");
      regSection.className = "info-section";
      regSection.id = "reg-section";
      regSection.innerHTML = `
        <h3><span>📅</span> Colony Registration</h3>
        <div class="info-content">
          <p>Joined the Mars Colony initiative on <strong>${new Date(user.registeredDate).toLocaleDateString()}</strong></p>
        </div>
      `;
      profileSections.appendChild(regSection);
    }
  }
}

// ==================== SETTINGS PAGE ====================
function initializeSettingsPage() {
  const settingsPage = document.querySelector(".settings-form");
  if (!settingsPage) return;

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userEmail = localStorage.getItem("userEmail");
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const currentUser = users.find((user) => user.email === userEmail);

  if (!isLoggedIn || !currentUser) {
    showNotification("Please login first", "error");
    setTimeout(() => (window.location.href = "login.html"), 2000);
    return;
  }

  loadUserSettings(currentUser);
  setupSettingsListeners(currentUser, users);
}

function loadUserSettings(user) {
  const emailField = document.getElementById("change-email");
  if (emailField) emailField.value = user.email;

  const addressField = document.getElementById("change-address");
  const savedAddress = localStorage.getItem("userAddress_" + user.email);
  if (addressField && savedAddress) addressField.value = savedAddress;

  const savedTheme = localStorage.getItem("userTheme_" + user.email);
  if (savedTheme) {
    const themeRadio = document.getElementById("theme-" + savedTheme);
    if (themeRadio) themeRadio.checked = true;
  } else {
    // Default to mars theme
    const marsTheme = document.getElementById("theme-mars");
    if (marsTheme) marsTheme.checked = true;
  }

  const notifications = document.getElementById("notifications");
  const locationSharing = document.getElementById("location-sharing");
  const dataSync = document.getElementById("data-sync");

  if (notifications)
    notifications.checked =
      localStorage.getItem("notifications_" + user.email) !== "false";
  if (locationSharing)
    locationSharing.checked =
      localStorage.getItem("location_" + user.email) !== "false";
  if (dataSync)
    dataSync.checked = localStorage.getItem("sync_" + user.email) === "true";
}

function setupSettingsListeners(currentUser, users) {
  // Save All Changes button
  const saveBtn =
    document.getElementById("save-settings") ||
    document.querySelector(".save-btn");
  if (saveBtn)
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      saveSettings(currentUser, users);
    });

  // Password change validation
  const newPassword = document.getElementById("new-password");
  const confirmPassword = document.getElementById("confirm-password");
  if (newPassword && confirmPassword) {
    [newPassword, confirmPassword].forEach((field) => {
      field.addEventListener("input", () =>
        validatePasswordMatch(newPassword, confirmPassword),
      );
    });
  }

  // Delete account button
  const deleteBtn =
    document.getElementById("delete-btn") ||
    document.querySelector(".delete-btn");
  if (deleteBtn)
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      deleteAccount(currentUser);
    });

  // Mission transfer button
  const transferBtn =
    document.getElementById("transfer-btn") ||
    document.querySelector(".danger-btn:not(.delete-btn)");
  if (transferBtn)
    transferBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification(
        "Mission transfer request sent to Mission Control",
        "success",
      );
    });

  // Back to profile link
  const backBtn =
    document.getElementById("back-to-profile") ||
    document.querySelector(".back-btn");
  if (backBtn)
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "profile.html";
    });
}

function saveSettings(currentUser, users) {
  const emailField = document.getElementById("change-email");
  const addressField = document.getElementById("change-address");
  const currentPassword = document.getElementById("current-password");
  const newPassword = document.getElementById("new-password");
  const confirmPassword = document.getElementById("confirm-password");
  let isValid = true;

  // Validate email if changed
  if (emailField && emailField.value !== currentUser.email) {
    if (!validateEmail(emailField.value)) {
      showError(emailField, "Please enter a valid email");
      isValid = false;
    } else {
      const emailExists = users.some(
        (u) => u.email === emailField.value && u.email !== currentUser.email,
      );
      if (emailExists) {
        showError(emailField, "Email already in use");
        isValid = false;
      } else {
        clearError(emailField);
        currentUser.email = emailField.value;
        localStorage.setItem("userEmail", emailField.value);
      }
    }
  }

  // Validate password change if fields are filled
  if (newPassword && newPassword.value) {
    if (!currentPassword || currentPassword.value !== currentUser.password) {
      showError(currentPassword, "Current password is incorrect");
      isValid = false;
    } else if (newPassword.value.length < 8) {
      showError(newPassword, "Password must be at least 8 characters");
      isValid = false;
    } else if (!validatePasswordStrength(newPassword.value)) {
      showError(
        newPassword,
        "Password must include letters, numbers, and special characters",
      );
      isValid = false;
    } else if (newPassword.value !== confirmPassword.value) {
      showError(confirmPassword, "Passwords do not match");
      isValid = false;
    } else {
      clearError(newPassword);
      clearError(confirmPassword);
      clearError(currentPassword);
      currentUser.password = newPassword.value;
    }
  }

  if (isValid) {
    // Save address
    if (addressField) {
      localStorage.setItem(
        "userAddress_" + currentUser.email,
        addressField.value,
      );
    }

    // Save theme preference
    const selectedTheme = document.querySelector('input[name="theme"]:checked');
    if (selectedTheme) {
      const themeId = selectedTheme.id.replace("theme-", "");
      localStorage.setItem("userTheme_" + currentUser.email, themeId);
    }

    // Save notification preferences
    const notifications = document.getElementById("notifications");
    const locationSharing = document.getElementById("location-sharing");
    const dataSync = document.getElementById("data-sync");

    if (notifications)
      localStorage.setItem(
        "notifications_" + currentUser.email,
        notifications.checked,
      );
    if (locationSharing)
      localStorage.setItem(
        "location_" + currentUser.email,
        locationSharing.checked,
      );
    if (dataSync)
      localStorage.setItem("sync_" + currentUser.email, dataSync.checked);

    // Update user in registeredUsers list
    const userIndex = users.findIndex((u) => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex] = currentUser;
      localStorage.setItem("registeredUsers", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    // Also update in manageUsers if exists
    let manageUsers = JSON.parse(localStorage.getItem("manageUsers")) || [];
    const manageUserIndex = manageUsers.findIndex(
      (u) => u.email === currentUser.email,
    );
    if (manageUserIndex !== -1) {
      manageUsers[manageUserIndex] = {
        id: currentUser.id,
        name: currentUser.name || currentUser.fullname,
        email: currentUser.email,
        role: currentUser.role,
      };
      localStorage.setItem("manageUsers", JSON.stringify(manageUsers));
    }

    showNotification("Settings saved successfully!", "success");

    // Clear password fields
    if (currentPassword) currentPassword.value = "";
    if (newPassword) newPassword.value = "";
    if (confirmPassword) confirmPassword.value = "";
  }
}

// ==================== DELETE ACCOUNT ====================
function deleteAccount(currentUser) {
  if (
    confirm(
      "⚠️ WARNING: This will permanently delete your colony account. Are you sure?",
    )
  ) {
    // Get current users
    const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const manageUsers = JSON.parse(localStorage.getItem("manageUsers")) || [];

    // Filter out the current user from registeredUsers
    const updatedUsers = users.filter((u) => u.email !== currentUser.email);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    // Also filter out from manageUsers (admin page)
    const updatedManageUsers = manageUsers.filter(
      (u) => u.email !== currentUser.email,
    );
    localStorage.setItem("manageUsers", JSON.stringify(updatedManageUsers));

    // Clear session
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("currentUser");

    showNotification("Account deleted. We're sorry to see you go.", "success");

    // Redirect to home page
    setTimeout(() => (window.location.href = "index.html"), 2000);
  }
}

// ==================== LOGOUT ====================
// ==================== LOGOUT ====================
function initializeLogout() {
  // Only look for links with the 'logout-link' class
  const logoutLink = document.querySelector(".logout-link");

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userFullName");
      localStorage.removeItem("currentUser");
      showNotification("Logged out successfully!", "success");
      setTimeout(() => (window.location.href = "index.html"), 1500);
    });
  }
}
// ==================== SIGNUP FORM ====================
function initializeSignupForm() {
  const signupForm = document.querySelector(".signup-form");
  if (!signupForm) return;

  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullname = document.getElementById("signup-fullname");
    const email = document.getElementById("signup-email");
    const password = document.getElementById("signup-password");
    const confirmPassword = document.getElementById("signup-confirm-password");
    const missionRole = document.getElementById("mission-role");
    const departureDate = document.getElementById("departure-date");
    let isValid = true;

    // Validation
    if (!fullname.value) {
      showError(fullname, "Full name is required");
      isValid = false;
    } else if (fullname.value.trim().length < 2) {
      showError(fullname, "Name must be at least 2 characters");
      isValid = false;
    } else if (!validateFullName(fullname.value)) {
      showError(
        fullname,
        "Please enter a valid name (letters and spaces only)",
      );
      isValid = false;
    } else {
      clearError(fullname);
    }

    if (!email.value) {
      showError(email, "Email is required");
      isValid = false;
    } else if (!validateEmail(email.value)) {
      showError(email, "Please enter a valid email address");
      isValid = false;
    } else {
      clearError(email);
    }

    if (!password.value) {
      showError(password, "Password is required");
      isValid = false;
    } else if (password.value.length < 8) {
      showError(password, "Password must be at least 8 characters");
      isValid = false;
    } else if (!validatePasswordStrength(password.value)) {
      showError(
        password,
        "Password must include letters, numbers, and special characters",
      );
      isValid = false;
    } else {
      clearError(password);
    }

    if (!confirmPassword.value) {
      showError(confirmPassword, "Please confirm your password");
      isValid = false;
    } else if (confirmPassword.value !== password.value) {
      showError(confirmPassword, "Passwords do not match");
      isValid = false;
    } else {
      clearError(confirmPassword);
    }

    if (isValid) {
      const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
      const existingUser = users.find(
        (user) => user.email.toLowerCase() === email.value.toLowerCase(),
      );

      if (existingUser) {
        showError(email, "This email is already registered. Please login.");
        return;
      }

      // Get current manageUsers
      let manageUsers = JSON.parse(localStorage.getItem("manageUsers")) || [];

      // Calculate next ID based on existing users
      let nextId;
      if (manageUsers.length === 0) {
        nextId = 1; // Start with 1 if empty
      } else {
        // Get the highest ID and add 1
        const maxId = Math.max(...manageUsers.map((u) => u.id));
        nextId = maxId + 1;
      }

      // Also check registeredUsers for any users not in manageUsers
      if (users.length > 0) {
        const maxRegisteredId = Math.max(...users.map((u) => u.id || 0));
        if (maxRegisteredId >= nextId) {
          nextId = maxRegisteredId + 1;
        }
      }

      let role = "Other";
      if (missionRole) {
        const roleMap = {
          scientist: "Scientist",
          engineer: "Engineer",
          medical: "Medical",
          pilot: "Pilot",
          agriculture: "Scientist",
          other: "Other",
        };
        role = roleMap[missionRole.value] || "Other";
      }

      const userData = {
        id: nextId, // This will be 1, 2, 3, etc.
        fullname: fullname.value.trim(),
        name: fullname.value.trim(),
        email: email.value.toLowerCase(),
        password: password.value,
        role: role,
        departure: departureDate ? departureDate.value : "",
        registeredDate: new Date().toISOString(),
      };

      users.push(userData);
      localStorage.setItem("registeredUsers", JSON.stringify(users));

      // Save to manageUsers
      saveToManageUsers({
        id: nextId,
        name: fullname.value.trim(),
        email: email.value.toLowerCase(),
        role: role,
      });

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email.value.toLowerCase());
      localStorage.setItem("userFullName", fullname.value.trim());
      localStorage.setItem("currentUser", JSON.stringify(userData));

      showNotification(
        "Registration successful! Welcome to the colony!",
        "success",
      );
      setTimeout(() => (window.location.href = "profile.html"), 1500);
    }
  });
}

// ==================== LOGIN FORM ====================
function initializeLoginForm() {
  const loginForm = document.querySelector(".login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    let isValid = true;

    if (!email.value) {
      showError(email, "Email is required");
      isValid = false;
    } else if (!validateEmail(email.value)) {
      showError(email, "Please enter a valid email address");
      isValid = false;
    } else {
      clearError(email);
    }

    if (!password.value) {
      showError(password, "Password is required");
      isValid = false;
    } else if (password.value.length < 6) {
      showError(password, "Password must be at least 6 characters");
      isValid = false;
    } else {
      clearError(password);
    }

    if (isValid) {
      const user = checkUserCredentials(email.value, password.value);

      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email.value);
        localStorage.setItem("userFullName", user.fullname || user.name);
        localStorage.setItem("currentUser", JSON.stringify(user));

        showNotification(
          "Login successful! Welcome, " +
            (user.fullname || user.name).split(" ")[0] +
            "!",
          "success",
        );

        // ✅ CHECK IF USER IS ADMIN AND REDIRECT APPROPRIATELY
        setTimeout(() => {
          if (email.value.toLowerCase() === "marsinitiative@admin.com") {
            window.location.href = "admin.html"; // Admin goes to admin dashboard
          } else {
            window.location.href = "profile.html"; // Regular users go to profile
          }
        }, 1500);
      } else {
        const userExists = checkIfUserExists(email.value);
        if (userExists) {
          showError(password, "Incorrect password. Please try again.");
        } else {
          showError(email, "Account not found. Please register first.");
        }
      }
    }
  });
}

// ==================== MANAGE USERS ====================
// Start with an empty array - only users you add or sign up will appear
let manageUsers = JSON.parse(localStorage.getItem("manageUsers")) || [];

let nextManageId =
  manageUsers.length > 0 ? Math.max(...manageUsers.map((u) => u.id)) + 1 : 1;

// NEW FUNCTION: Update nextManageId after any changes
function updateNextManageId() {
  nextManageId =
    manageUsers.length > 0 ? Math.max(...manageUsers.map((u) => u.id)) + 1 : 1;
}

function initializeManageUsers() {
  if (!document.getElementById("tableBody")) return;
  refreshManageTable();
}

function showForm() {
  document.getElementById("userForm").style.display = "block";
}

function hideForm() {
  document.getElementById("userForm").style.display = "none";
  document.getElementById("userName").value = "";
  document.getElementById("userEmail").value = "";
  document.getElementById("userPassword").value = "";
}

// ✅ UPDATED FUNCTION WITH EMAIL VALIDATION
function addUser() {
  let name = document.getElementById("userName").value;
  let email = document.getElementById("userEmail").value;
  let password = document.getElementById("userPassword").value;
  let role = document.getElementById("userRole").value;

  if (!name || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  // ✅ CHECK FOR EXISTING EMAIL IN manageUsers
  const emailExists = manageUsers.some(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );

  if (emailExists) {
    alert("This email is already registered. Please use a different email.");
    return;
  }

  // ✅ ALSO CHECK IN registeredUsers
  let registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const registeredEmailExists = registeredUsers.some(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );

  if (registeredEmailExists) {
    alert("This email is already registered. Please use a different email.");
    return;
  }

  const newUser = {
    id: nextManageId++,
    name: name,
    email: email,
    role: role,
  };

  manageUsers.push(newUser);
  localStorage.setItem("manageUsers", JSON.stringify(manageUsers));
  saveToRegisteredUsers(newUser, password);
  refreshManageTable();
  hideForm();
  updateNextManageId();
  alert(
    "User added successfully! They can now login with the password you set.",
  );
}

function saveToRegisteredUsers(user, password) {
  let registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const exists = registeredUsers.some((u) => u.email === user.email);

  if (!exists) {
    registeredUsers.push({
      id: user.id,
      fullname: user.name,
      name: user.name,
      email: user.email,
      password: password,
      role: user.role,
      registeredDate: new Date().toISOString(),
    });
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
  }
}

function deleteUser(id) {
  if (confirm("Delete this user?")) {
    const userToDelete = manageUsers.find((u) => u.id === id);
    manageUsers = manageUsers.filter((user) => user.id !== id);
    localStorage.setItem("manageUsers", JSON.stringify(manageUsers));
    deleteFromRegisteredUsers(userToDelete.email);
    refreshManageTable();
    updateNextManageId();
  }
}

function deleteFromRegisteredUsers(email) {
  let registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  registeredUsers = registeredUsers.filter((u) => u.email !== email);
  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
}

function refreshManageTable() {
  let tbody = document.getElementById("tableBody");
  if (!tbody) return;

  let html = "";
  for (let user of manageUsers) {
    let roleClass = user.role.toLowerCase();
    html += `<tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="role ${roleClass}">${user.role}</span></td>
      <td><button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button></td>
    </tr>`;
  }
  tbody.innerHTML = html;
}

function saveToManageUsers(user) {
  let manageUsers = JSON.parse(localStorage.getItem("manageUsers")) || [];

  // Check if user already exists
  const exists = manageUsers.some((u) => u.email === user.email);

  if (!exists) {
    manageUsers.push(user);
    localStorage.setItem("manageUsers", JSON.stringify(manageUsers));
    updateNextManageId();
  }
}

// ==================== LOCAL STORAGE HELPERS ====================
function checkUserCredentials(email, password) {
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  return (
    users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password,
    ) || null
  );
}

function checkIfUserExists(email) {
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  return users.some((user) => user.email.toLowerCase() === email.toLowerCase());
}

// ==================== VALIDATION HELPERS ====================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function validateFullName(name) {
  return /^[a-zA-Z\s]+$/.test(name.trim());
}

function validatePasswordStrength(password) {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasLetter && hasNumber && hasSpecial;
}

function validatePasswordMatch(newPass, confirmPass) {
  if (confirmPass.value && newPass.value !== confirmPass.value) {
    showError(confirmPass, "Passwords do not match");
    return false;
  } else if (confirmPass.value) {
    clearError(confirmPass);
    return true;
  }
  return true;
}

// ==================== DISPLAY HELPERS ====================
function getRoleDisplay(role) {
  const roles = {
    scientist: "Research Scientist",
    engineer: "Colony Engineer",
    agriculture: "Agricultural Specialist",
    medical: "Medical Officer",
    pilot: "Transport Pilot",
    other: "Colony Specialist",
  };
  return roles[role] || role || "Colony Specialist";
}

function getDepartureDisplay(departure) {
  const departures = {
    2028: "Mars Mission 2028",
    2030: "Mars Mission 2030",
    2032: "Mars Mission 2032",
    2035: "Mars Mission 2035",
    undecided: "Undecided",
  };
  return departures[departure] || departure;
}

// ==================== UI HELPERS ====================
function showError(input, message) {
  clearError(input);
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.cssText =
    "color:#ff4444;font-size:0.85em;margin-top:5px;margin-bottom:10px;font-family:Arial,sans-serif;animation:fadeIn 0.3s ease;";
  errorDiv.textContent = message;
  input.style.border = "2px solid #ff4444";
  input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

function clearError(input) {
  input.style.border = "";
  const errorDiv = input.parentNode.querySelector(".error-message");
  if (errorDiv) errorDiv.remove();
}

function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".auth-notification");
  if (existingNotification) existingNotification.remove();

  const notification = document.createElement("div");
  notification.className = "auth-notification";
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px 25px;
    border-radius: 5px; color: white; font-weight: bold; z-index: 9999;
    animation: slideIn 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    background-color: ${type === "success" ? "#4CAF50" : "#f44336"};
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==================== ANIMATION STYLES ====================
(function addAnimationStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);
})();
