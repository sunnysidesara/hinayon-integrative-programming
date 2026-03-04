// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", function () {
  initializeSignupForm();
  initializeLoginForm();
  initializeProfilePage();
  initializeSettingsPage(); // New function for settings
  initializeLogout();
});

// ==================== PROFILE PAGE DISPLAY ====================
function initializeProfilePage() {
  const profilePage = document.querySelector(".dashboard-main");
  if (!profilePage) return;

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userEmail = localStorage.getItem("userEmail");

  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const currentUser = users.find((user) => user.email === userEmail);

  if (!isLoggedIn || !currentUser) {
    showNotification("Please login first", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  updateProfileDisplay(currentUser);
}

function updateProfileDisplay(user) {
  // Update profile name and email
  const profileName = document.querySelector(".profile-name");
  const profileEmail = document.querySelector(".profile-email");

  if (profileName) profileName.textContent = user.fullname || "Astronaut Name";
  if (profileEmail)
    profileEmail.textContent = user.email || "email@marscolony.space";

  // Update about text
  const aboutText = document.querySelector(".about-text");
  if (aboutText) {
    let roleText = getRoleDisplay(user.role);
    aboutText.innerHTML = `Hi!✨ I am ${user.fullname.split(" ")[0]}, a ${roleText} with the Mars Colony. ${user.departure ? `Expected departure: ${user.departure}.` : ""} Proud member of humanity's greatest adventure!`;
  }

  // Update mission ID
  const missionId = document.getElementById("mission-id");
  if (missionId) {
    const id =
      "MC-" +
      Math.floor(Math.random() * 10000) +
      "-" +
      user.email.substring(0, 2).toUpperCase();
    missionId.textContent = id;
  }

  // Update role and departure
  const userRole = document.getElementById("user-role");
  const userDeparture = document.getElementById("user-departure");

  if (userRole)
    userRole.textContent = getRoleDisplay(user.role) || "Not specified";
  if (userDeparture)
    userDeparture.textContent =
      getDepartureDisplay(user.departure) || "Not specified";

  // Update date
  const currentDate = document.getElementById("current-date");
  if (currentDate) {
    const today = new Date();
    currentDate.textContent = `Sol ${Math.floor(Math.random() * 1000 + 1000)}`;
  }

  // Add registration date
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

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userEmail = localStorage.getItem("userEmail");

  const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const currentUser = users.find((user) => user.email === userEmail);

  if (!isLoggedIn || !currentUser) {
    showNotification("Please login first", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  // Load user data into settings form
  loadUserSettings(currentUser);

  // Add event listeners for settings buttons
  setupSettingsListeners(currentUser, users);
}

function loadUserSettings(user) {
  // Load email
  const emailField = document.getElementById("change-email");
  if (emailField) emailField.value = user.email;

  // Load address (if saved)
  const addressField = document.getElementById("change-address");
  const savedAddress = localStorage.getItem("userAddress_" + user.email);
  if (addressField && savedAddress) addressField.value = savedAddress;

  // Load theme preference
  const savedTheme = localStorage.getItem("userTheme_" + user.email);
  if (savedTheme) {
    const themeRadio = document.getElementById("theme-" + savedTheme);
    if (themeRadio) themeRadio.checked = true;
  }

  // Load notification preferences
  const notifications = document.getElementById("notifications");
  const locationSharing = document.getElementById("location-sharing");
  const dataSync = document.getElementById("data-sync");

  if (notifications) {
    notifications.checked =
      localStorage.getItem("notifications_" + user.email) !== "false";
  }
  if (locationSharing) {
    locationSharing.checked =
      localStorage.getItem("location_" + user.email) !== "false";
  }
  if (dataSync) {
    dataSync.checked = localStorage.getItem("sync_" + user.email) === "true";
  }
}

function setupSettingsListeners(currentUser, users) {
  // Save All Changes button
  const saveBtn = document.querySelector(".save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function (e) {
      e.preventDefault();
      saveSettings(currentUser, users);
    });
  }

  // Password change validation
  const newPassword = document.getElementById("new-password");
  const confirmPassword = document.getElementById("confirm-password");

  if (newPassword && confirmPassword) {
    [newPassword, confirmPassword].forEach((field) => {
      field.addEventListener("input", function () {
        validatePasswordMatch(newPassword, confirmPassword);
      });
    });
  }

  // Delete account button
  const deleteBtn = document.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function (e) {
      e.preventDefault();
      deleteAccount(currentUser);
    });
  }

  // Mission transfer button
  const transferBtn = document.querySelector(".danger-btn:not(.delete-btn)");
  if (transferBtn) {
    transferBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showNotification(
        "Mission transfer request sent to Mission Control",
        "success",
      );
    });
  }

  // Back to profile link
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "profile.html";
    });
  }
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
      // Check if email already exists
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
    // Check current password
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

    showNotification("Settings saved successfully!", "success");

    // Clear password fields
    if (currentPassword) currentPassword.value = "";
    if (newPassword) newPassword.value = "";
    if (confirmPassword) confirmPassword.value = "";
  }
}

/**
 * Deletes user account
 */
function deleteAccount(currentUser) {
  if (
    confirm(
      "⚠️ WARNING: This will permanently delete your colony account. Are you sure?",
    )
  ) {
    const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
    const updatedUsers = users.filter((u) => u.email !== currentUser.email);

    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    // Clear session
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("currentUser");

    showNotification("Account deleted. We're sorry to see you go.", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  }
}

/**
 * Validates password match
 */
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

// ==================== HELPER FUNCTIONS ====================

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

// ==================== LOGOUT FUNCTION ====================
function initializeLogout() {
  const logoutLink = document.querySelector('a[href="login.html"]');

  if (logoutLink && logoutLink.textContent.includes("Logout")) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userFullName");
      localStorage.removeItem("currentUser");

      showNotification("Logged out successfully!", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    });
  }
}

// ==================== SIGNUP FORM VALIDATION ====================
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

    // Full name validation
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

    // Email validation
    if (!email.value) {
      showError(email, "Email is required");
      isValid = false;
    } else if (!validateEmail(email.value)) {
      showError(email, "Please enter a valid email address");
      isValid = false;
    } else {
      clearError(email);
    }

    // Password validation
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

    // Confirm password validation
    if (!confirmPassword.value) {
      showError(confirmPassword, "Please confirm your password");
      isValid = false;
    } else if (confirmPassword.value !== password.value) {
      showError(confirmPassword, "Passwords do not match");
      isValid = false;
    } else {
      clearError(confirmPassword);
    }

    // If valid, save user data and go to profile
    if (isValid) {
      const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
      const existingUser = users.find(
        (user) => user.email.toLowerCase() === email.value.toLowerCase(),
      );

      if (existingUser) {
        showError(email, "This email is already registered. Please login.");
        return;
      }

      const userData = {
        fullname: fullname.value.trim(),
        email: email.value.toLowerCase(),
        password: password.value,
        role: missionRole ? missionRole.value : "",
        departure: departureDate ? departureDate.value : "",
        registeredDate: new Date().toISOString(),
      };

      users.push(userData);
      localStorage.setItem("registeredUsers", JSON.stringify(users));

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email.value.toLowerCase());
      localStorage.setItem("userFullName", fullname.value.trim());
      localStorage.setItem("currentUser", JSON.stringify(userData));

      showNotification(
        "Registration successful! Welcome to the colony!",
        "success",
      );

      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1500);
    }
  });
}

// ==================== LOGIN FORM VALIDATION ====================
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
        localStorage.setItem("userFullName", user.fullname);
        localStorage.setItem("currentUser", JSON.stringify(user));

        showNotification(
          "Login successful! Welcome back, " +
            user.fullname.split(" ")[0] +
            "!",
          "success",
        );

        setTimeout(() => {
          window.location.href = "profile.html";
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

// ==================== LOCAL STORAGE FUNCTIONS ====================

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

// ==================== VALIDATION HELPER FUNCTIONS ====================

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateFullName(name) {
  const re = /^[a-zA-Z\s]+$/;
  return re.test(name.trim());
}

function validatePasswordStrength(password) {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasLetter && hasNumber && hasSpecial;
}

// ==================== UI HELPER FUNCTIONS ====================

function showError(input, message) {
  clearError(input);

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.color = "#ff4444";
  errorDiv.style.fontSize = "0.85em";
  errorDiv.style.marginTop = "5px";
  errorDiv.style.marginBottom = "10px";
  errorDiv.style.fontFamily = "Arial, sans-serif";
  errorDiv.style.animation = "fadeIn 0.3s ease";
  errorDiv.textContent = message;

  input.style.borderColor = "#ff4444";
  input.style.borderWidth = "2px";
  input.style.borderStyle = "solid";

  if (input.nextSibling) {
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
  } else {
    input.parentNode.appendChild(errorDiv);
  }
}

function clearError(input) {
  input.style.borderColor = "";
  input.style.borderWidth = "";
  input.style.borderStyle = "";

  const parent = input.parentNode;
  const errorDiv = parent.querySelector(".error-message");
  if (errorDiv) {
    errorDiv.remove();
  }
}

function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".auth-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = "auth-notification";
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.padding = "15px 25px";
  notification.style.borderRadius = "5px";
  notification.style.color = "white";
  notification.style.fontWeight = "bold";
  notification.style.zIndex = "9999";
  notification.style.animation = "slideIn 0.3s ease";
  notification.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";

  if (type === "success") {
    notification.style.backgroundColor = "#4CAF50";
  } else {
    notification.style.backgroundColor = "#f44336";
  }

  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// ==================== ANIMATION STYLES ====================
(function addAnimationStyles() {
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
  document.head.appendChild(style);
})();
