import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, createUserWithEmailAndPassword, updateProfile, updatePassword, signOut, type Auth, type User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, onSnapshot, doc, setDoc, type Firestore } from "firebase/firestore";
import axios from "axios";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const loginConfig = {
  appfbId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
  clientfbSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET,
  appggId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientggSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  appghId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  clientghSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
};
const telegramConfig = {
  botToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
  chatId: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
  botName: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME,
  chatName: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_NAME,
  botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  chatUsername: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_USERNAME,
  botId: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID,
};
const twilioConfig = {
  accountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
  authToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
  whatsappNumber: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER,
  whatsappServiceSid: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_SERVICE_SID,
  whatsappApiKey: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_API_KEY,
  whatsappApiSecret: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_API_SECRET,
  whatsappApiUrl: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_API_URL,
  whatsappApiVersion: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_API_VERSION,
  whatsappApiRegion: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_API_REGION,
};

// Ensure all required environment variables are set
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error("Firebase configuration is incomplete. Please check your environment variables.");
}

// Initialize Firebase
let app: any;
let auth: Auth | null = null;
let db: Firestore | null = null;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !!db && !!auth;
};

// Get device info
export const getDeviceInfo = (): { deviceType: string; browser: string; os: string } => {
  if (typeof navigator === "undefined") {
    return { deviceType: "Unknown", browser: "Unknown", os: "Unknown" };
  }
  return {
    deviceType: navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop",
    browser: navigator.userAgent.split(")")[0].split(" ").pop() || "Unknown",
    os: navigator.platform || "Unknown",
  };
};

// Get IP address
export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    return response.data.ip || "Unknown";
  } catch {
    return "Unknown";
  }
};

// Send Telegram notification
const sendTelegramNotification = async (message: string): Promise<void> => {
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.warn("Telegram notification failed:", error);
  }
};

// Send WhatsApp notification via Twilio
const sendWhatsAppNotification = async (message: string): Promise<void> => {
  try {
    await axios.post("/api/send-whatsapp", {
      to: process.env.TWILIO_WHATSAPP_NUMBER,
      body: message,
    });
  } catch (error) {
    console.warn("WhatsApp notification failed:", error);
  }
};

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  name: string;
  balance: number;
  avatar: string;
  provider: string;
  createdAt: string;
  lastActivity: string;
  loginCount: number;
  ipAddress: string;
  status?: string;
  password?: string;
}

interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  user?: { email: string; name: string };
  admin?: { email: string; name: string; loginTime: string };
  timestamp: string;
  device: string;
  ip: string;
  read?: boolean;
}

// User management
export const userManager = {
  setUser: async (user: UserData): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qtusdev_user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
    if (isFirebaseConfigured()) {
      try {
        await setDoc(doc(db!, "users", user.uid), user);
      } catch (error) {
        console.warn("Firestore user save failed:", error);
      }
    }
  },

  getUser: async (): Promise<UserData | null> => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("qtusdev_user") || localStorage.getItem("currentUser");
      if (user) return JSON.parse(user);
    }
    return null;
  },

  removeUser: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("qtusdev_user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
    }
  },

  updateBalance: async (newBalance: number): Promise<void> => {
    const user = await userManager.getUser();
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      await userManager.setUser(updatedUser);
    }
  },

  isLoggedIn: (): boolean => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLoggedIn") === "true";
    }
    return false;
  },
};

// Cart management
export const cartManager = {
  getCart: (): number[] => {
    if (typeof window !== "undefined") {
      const cart = localStorage.getItem("qtusdev_cart");
      return cart ? JSON.parse(cart) : [];
    }
    return [];
  },

  setCart: (cart: number[]): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qtusdev_cart", JSON.stringify(cart));
    }
  },

  addToCart: (productId: number): void => {
    const cart = cartManager.getCart();
    if (!cart.includes(productId)) {
      cart.push(productId);
      cartManager.setCart(cart);
    }
  },

  removeFromCart: (productId: number): void => {
    const cart = cartManager.getCart().filter((id) => id !== productId);
    cartManager.setCart(cart);
  },

  clearCart: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("qtusdev_cart");
    }
  },
};

// Purchased products management
export const purchaseManager = {
  getPurchasedProducts: (): number[] => {
    if (typeof window !== "undefined") {
      const purchased = localStorage.getItem("qtusdev_purchased");
      return purchased ? JSON.parse(purchased) : [];
    }
    return [];
  },

  setPurchasedProducts: (products: number[]): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("qtusdev_purchased", JSON.stringify(products));
    }
  },

  addPurchasedProduct: (productId: number): void => {
    const purchased = purchaseManager.getPurchasedProducts();
    if (!purchased.includes(productId)) {
      purchased.push(productId);
      purchaseManager.setPurchasedProducts(purchased);
    }
  },
};

// Firebase Auth functions
export const signInWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  const ipAddress = await getIPAddress();
  const deviceInfo = getDeviceInfo();

  try {
    if (isFirebaseConfigured()) {
      const result = await signInWithEmailAndPassword(auth!, email, password);
      const user = result.user;
      const userData: UserData = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || email.split("@")[0],
        name: user.displayName || email.split("@")[0],
        balance: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || email.split("@")[0])}&background=random`,
        provider: "email",
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        loginCount: 1,
        ipAddress,
        status: "active",
      };
      await userManager.setUser(userData);
      const message = `👤 <b>${userData.name}</b> đã đăng nhập<br>📧 Email: ${userData.email}<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;
      await Promise.all([
        sendTelegramNotification(message),
        sendWhatsAppNotification(message),
        saveNotification({
          type: "user_login",
          title: "Đăng nhập thành công",
          message,
          user: { email: userData.email, name: userData.name },
          timestamp: new Date().toISOString(),
          device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
          ip: ipAddress,
        }),
      ]);
      return { user, error: null };
    }
  } catch (error: any) {
    console.warn("Firebase auth failed, using fallback:", error);
  }

  // Fallback to localStorage
  try {
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const registeredUser = registeredUsers.find((u: any) => u.email === email && u.password === password);

    if (registeredUser) {
      const userData: UserData = {
        ...registeredUser,
        lastActivity: new Date().toISOString(),
        loginCount: (registeredUser.loginCount || 0) + 1,
        ipAddress,
      };
      await userManager.setUser(userData);
      const message = `👤 <b>${userData.name}</b> đã đăng nhập<br>📧 Email: ${userData.email}<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;
      await Promise.all([
        sendTelegramNotification(message),
        sendWhatsAppNotification(message),
        saveNotification({
          type: "user_login",
          title: "Đăng nhập thành công",
          message,
          user: { email: userData.email, name: userData.name },
          timestamp: new Date().toISOString(),
          device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
          ip: ipAddress,
        }),
      ]);
      return {
        user: {
          uid: registeredUser.uid,
          email: registeredUser.email,
          displayName: registeredUser.name,
        } as User,
        error: null,
      };
    }
  } catch (error) {
    console.warn("LocalStorage auth failed:", error);
  }

  return { user: null, error: "Email hoặc mật khẩu không chính xác!" };
};

export const signUpWithEmail = async (email: string, password: string, userData: { name: string }): Promise<{ user: User | null; error: string | null }> => {
  const ipAddress = await getIPAddress();
  const deviceInfo = getDeviceInfo();

  try {
    if (isFirebaseConfigured()) {
      const result = await createUserWithEmailAndPassword(auth!, email, password);
      await updateProfile(result.user, { displayName: userData.name });
      const fullUserData: UserData = {
        uid: result.user.uid,
        email,
        displayName: userData.name,
        name: userData.name,
        balance: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
        provider: "email",
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        loginCount: 1,
        ipAddress,
        status: "active",
      };
      await userManager.setUser(fullUserData);
      const message = `🎉 <b>${userData.name}</b> đã đăng ký tài khoản mới<br>📧 Email: ${email}<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;
      await Promise.all([
        sendTelegramNotification(message),
        sendWhatsAppNotification(message),
        saveNotification({
          type: "user_registration",
          title: "Đăng ký thành công",
          message,
          user: { email, name: userData.name },
          timestamp: new Date().toISOString(),
          device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
          ip: ipAddress,
          read: false,
        }),
      ]);
      return { user: result.user, error: null };
    }
  } catch (error: any) {
    console.warn("Firebase signup failed, using fallback:", error);
    return { user: null, error: error.message || "Không thể đăng ký tài khoản!" };
  }

  // Fallback to localStorage
  try {
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    if (registeredUsers.find((u: any) => u.email === email)) {
      return { user: null, error: "Email này đã được đăng ký!" };
    }

    const newUser: UserData = {
      uid: Date.now().toString(),
      email,
      displayName: userData.name,
      name: userData.name,
      balance: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      provider: "email",
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      loginCount: 1,
      ipAddress,
      status: "active",
      password,
    };
    registeredUsers.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
    const { password: _, ...userWithoutPassword } = newUser;
    await userManager.setUser(userWithoutPassword);
    const message = `🎉 <b>${userData.name}</b> đã đăng ký tài khoản mới<br>📧 Email: ${email}<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;
    await Promise.all([
      sendTelegramNotification(message),
      sendWhatsAppNotification(message),
      saveNotification({
        type: "user_registration",
        title: "Đăng ký thành công",
        message,
        user: { email, name: userData.name },
        timestamp: new Date().toISOString(),
        device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
        ip: ipAddress,
        read: false,
      }),
    ]);
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    console.warn("LocalStorage signup failed:", error);
    return { user: null, error: "Không thể đăng ký tài khoản!" };
  }
};

export const signOutUser = async (): Promise<{ error: string | null }> => {
  try {
    if (isFirebaseConfigured()) {
      await signOut(auth!);
    }
    await userManager.removeUser();
    return { error: null };
  } catch (error: any) {
    console.warn("Sign out failed:", error);
    return { error: error.message || "Không thể đăng xuất!" };
  }
};

export const changePassword = async (email: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error: string | null }> => {
  const ipAddress = await getIPAddress();
  const deviceInfo = getDeviceInfo();

  try {
    if (isFirebaseConfigured() && auth!.currentUser) {
      if (currentPassword) {
        await signInWithEmailAndPassword(auth!, email, currentPassword);
      }
      await updatePassword(auth!.currentUser, newPassword);
      const message = `🔑 <b>${email}</b> đã đổi mật khẩu<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;
      await Promise.all([
        sendTelegramNotification(message),
        sendWhatsAppNotification(message),
        saveNotification({
          type: "change_password",
          title: "Đổi mật khẩu",
          message,
          user: { email, name: auth!.currentUser.displayName || "User" },
          timestamp: new Date().toISOString(),
          device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
          ip: ipAddress,
        }),
      ]);
      return { success: true, error: null };
    }
  } catch (error: any) {
    console.warn("Firebase change password failed:", error);
  }

  // Fallback to localStorage
  try {
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const user = registeredUsers.find((u: any) => u.email === email && (!currentPassword || u.password === currentPassword));
    if (!user) {
      return { success: false, error: "Mật khẩu hiện tại không đúng!" };
    }

    const updatedUsers = registeredUsers.map((u: any) =>
      u.email === email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (currentUser.email === email) {
      localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, password: newPassword }));
    }

    const message = `🔑 <b>${email}</b> đã đổi mật khẩu<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;
    await Promise.all([
      sendTelegramNotification(message),
      sendWhatsAppNotification(message),
      saveNotification({
        type: "change_password",
        title: "Đổi mật khẩu",
        message,
        user: { email, name: user.name || "User" },
        timestamp: new Date().toISOString(),
        device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
        ip: ipAddress,
      }),
    ]);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Change password error:", error);
    return { success: false, error: error.message || "Đã xảy ra lỗi khi đổi mật khẩu!" };
  }
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error: string | null; token?: string }> => {
  const ipAddress = await getIPAddress();
  const deviceInfo = getDeviceInfo();

  try {
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const user = registeredUsers.find((u: any) => u.email === email);
    if (!user) {
      return { success: false, error: "Email không tồn tại!" };
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expires = new Date(Date.now() + 3600000);
    let resetRequests = JSON.parse(localStorage.getItem("resetRequests") || "[]");
    resetRequests.push({
      email,
      token,
      expires: expires.toISOString(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("resetRequests", JSON.stringify(resetRequests));

    const message = `🔄 Yêu cầu đổi mật khẩu cho <b>${email}</b><br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}<br>🔗 Token: ${token}`;
    await Promise.all([
      sendTelegramNotification(message),
      sendWhatsAppNotification(message),
      saveNotification({
        type: "password_reset",
        title: "Yêu cầu đổi mật khẩu",
        message,
        user: { email, name: user.name || "User" },
        timestamp: new Date().toISOString(),
        device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
        ip: ipAddress,
      }),
    ]);

    return { success: true, error: null, token };
  } catch (error: any) {
    console.error("Request password reset error:", error);
    return { success: false, error: error.message || "Đã xảy ra lỗi khi gửi yêu cầu đổi mật khẩu!" };
  }
};

// Database functions
export const saveNotification = async (notification: Notification): Promise<{ error: string | null }> => {
  try {
    if (isFirebaseConfigured()) {
      await addDoc(collection(db!, "notifications"), { ...notification, read: false });
    }
  } catch (error: any) {
    console.warn("Firestore notification save failed:", error);
  }

  try {
    if (typeof window !== "undefined") {
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      notifications.unshift({ ...notification, id: Date.now().toString() });
      localStorage.setItem("notifications", JSON.stringify(notifications.slice(0, 100)));
    }
  } catch (error) {
    console.warn("LocalStorage notification save failed:", error);
  }

  return { error: null };
};

// Real-time listeners
export const onNotificationsChange = (callback: (notifications: Notification[]) => void): (() => void) => {
  const loadFromStorage = () => {
    if (typeof window !== "undefined") {
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      callback(notifications);
    }
  };

  try {
    if (isFirebaseConfigured()) {
      const q = query(collection(db!, "notifications"), orderBy("timestamp", "desc"));
      return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
        callback(notifications);
      });
    } else {
      loadFromStorage();
    }
  } catch (error) {
    console.warn("Firestore notifications listener failed, using fallback:", error);
    loadFromStorage();
  }

  return () => {};
};

// Admin functions
export const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error: string | null }> => {
  const adminCredentials = [
    { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
  ].filter((cred) => cred.email && cred.password);
  const admin = adminCredentials.find((a) => a.email === email && a.password === password);

  if (admin) {
    const ipAddress = await getIPAddress();
    const deviceInfo = getDeviceInfo();
    if (typeof window !== "undefined") {
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          email: admin.email,
          name: "Admin",
          role: "admin",
          loginTime: new Date().toISOString(),
        })
      );
    }
    const message = `👑 <b>Admin ${admin.email}</b> đã đăng nhập<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;
    await Promise.all([
      sendTelegramNotification(message),
      sendWhatsAppNotification(message),
      saveNotification({
        type: "admin_login",
        title: "Admin đăng nhập",
        message,
        admin: {
          email: admin.email,
          name: "Admin",
          loginTime: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
        ip: ipAddress,
      }),
    ]);
    return { success: true, error: null };
  }
  return { success: false, error: "Thông tin đăng nhập không chính xác!" };
};

export const adminLogout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminUser");
  }
};

export const getAdminUser = (): { email: string; name: string; role: string; loginTime: string } | null => {
  if (typeof window !== "undefined") {
    const admin = localStorage.getItem("adminUser");
    return admin ? JSON.parse(admin) : null;
  }
  return null;
};

// Additional utility functions
export const getCurrentUser = userManager.getUser;
export const isAuthenticated = userManager.isLoggedIn;
export const isAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("adminAuth") === "true";
};

// Export Firebase auth providers
export { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink };
