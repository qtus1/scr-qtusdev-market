import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, getDocs, where, type Firestore } from 'firebase/firestore';
import axios from 'axios';

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

// Initialize Firebase
let app: any;
let auth: Auth | null = null;
let db: Firestore | null = null;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !!db && !!auth;
};

// Get device info (client-side safe)
export const getDeviceInfo = (): { deviceType: string; browser: string; os: string } => {
  if (typeof navigator === 'undefined') {
    return { deviceType: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  }
  return {
    deviceType: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
    browser: navigator.userAgent.split(')')[0].split(' ').pop() || 'Unknown',
    os: navigator.platform || 'Unknown',
  };
};

// Get IP address (client-side safe)
export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

// Generate secure token
const generateSecureToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// User management
export const userManager = {
  setUser: async (user: UserData): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qtusdev_user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    try {
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    } catch (error) {
      console.error('API save user failed:', error);
    }
    if (isFirebaseConfigured()) {
      try {
        await setDoc(doc(db!, 'users', user.uid), user);
      } catch (error) {
        console.error('Firestore user save failed:', error);
      }
    }
  },

  getUser: async (): Promise<UserData | null> => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('qtusdev_user') || localStorage.getItem('currentUser');
      if (user) return JSON.parse(user);
    }
    return null;
  },

  removeUser: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qtusdev_user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
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
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  },
};

// Cart management
export const cartManager = {
  getCart: (): number[] => {
    if (typeof window !== 'undefined') {
      const cart = localStorage.getItem('qtusdev_cart');
      return cart ? JSON.parse(cart) : [];
    }
    return [];
  },

  setCart: (cart: number[]): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qtusdev_cart', JSON.stringify(cart));
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qtusdev_cart');
    }
  },
};

// Purchased products management
export const purchaseManager = {
  getPurchasedProducts: (): number[] => {
    if (typeof window !== 'undefined') {
      const purchased = localStorage.getItem('qtusdev_purchased');
      return purchased ? JSON.parse(purchased) : [];
    }
    return [];
  },

  setPurchasedProducts: (products: number[]): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qtusdev_purchased', JSON.stringify(products));
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
export const signInWithEmail = async (
  email: string,
  password: string,
  options: { deviceInfo: { deviceType: string; browser: string; os: string }; ipAddress: string; rememberMe: boolean }
): Promise<{ user: User | null; error: string | null }> => {
  try {
    if (isFirebaseConfigured()) {
      const result = await signInWithEmailAndPassword(auth!, email, password);
      const user = result.user;
      const userData: UserData = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || email.split('@')[0],
        name: user.displayName || email.split('@')[0],
        balance: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || email.split('@')[0])}&background=random`,
        provider: 'email',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        loginCount: 1,
        ipAddress: options.ipAddress,
        status: 'active',
      };
      const response = await fetch('/api/get-user', {
        method: 'GET',
        headers: { 'X-User-ID': user.uid },
      });
      const existingUser = await response.json();
      if (existingUser.data) {
        userData.balance = existingUser.data.balance || 0;
        userData.createdAt = existingUser.data.createdAt;
        userData.loginCount = (existingUser.data.loginCount || 0) + 1;
      }
      await userManager.setUser(userData);
      const message = `👤 <b>${userData.name}</b> đã đăng nhập<br>📧 Email: ${userData.email}<br>🌐 IP: ${options.ipAddress}<br>📱 Thiết bị: ${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await Promise.all([
        fetch('/api/send-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/save-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'user_login',
            title: 'Đăng nhập thành công',
            message,
            user: { email: userData.email, name: userData.name },
            timestamp: new Date().toISOString(),
            device: `${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})`,
            ip: options.ipAddress,
          }),
        }),
      ]);
      return { user, error: null };
    }
  } catch (error: any) {
    console.error('Firebase auth failed:', error);
  }

  // Fallback to localStorage and MySQL
  try {
    const response = await fetch('/api/sign-in-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...options }),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Fallback auth failed:', error);
    return { user: null, error: 'Email hoặc mật khẩu không chính xác!' };
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  userData: { name: string },
  options: { deviceInfo: { deviceType: string; browser: string; os: string }; ipAddress: string }
): Promise<{ user: User | null; error: string | null }> => {
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
        provider: 'email',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        loginCount: 1,
        ipAddress: options.ipAddress,
        status: 'active',
      };
      await userManager.setUser(fullUserData);
      const message = `🎉 <b>${userData.name}</b> đã đăng ký tài khoản mới<br>📧 Email: ${email}<br>🌐 IP: ${options.ipAddress}<br>📱 Thiết bị: ${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await Promise.all([
        fetch('/api/send-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/save-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'user_registration',
            title: 'Đăng ký thành công',
            message,
            user: { email, name: userData.name },
            timestamp: new Date().toISOString(),
            device: `${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})`,
            ip: options.ipAddress,
            read: false,
          }),
        }),
      ]);
      return { user: result.user, error: null };
    }
  } catch (error: any) {
    console.error('Firebase signup failed:', error);
    return { user: null, error: error.message || 'Không thể đăng ký tài khoản!' };
  }

  // Fallback to localStorage and MySQL
  try {
    const response = await fetch('/api/sign-up-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userData, ...options }),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Fallback signup failed:', error);
    return { user: null, error: 'Không thể đăng ký tài khoản!' };
  }
};

export const signInWithSocialProvider = async (
  providerType: 'google' | 'facebook' | 'github',
  options: { deviceInfo: { deviceType: string; browser: string; os: string }; ipAddress: string }
): Promise<{ user: User | null; error: string | null }> => {
  let provider;
  switch (providerType) {
    case 'google':
      provider = new GoogleAuthProvider();
      break;
    case 'facebook':
      provider = new FacebookAuthProvider();
      break;
    case 'github':
      provider = new GithubAuthProvider();
      break;
    default:
      return { user: null, error: 'Invalid provider' };
  }

  try {
    if (isFirebaseConfigured()) {
      const result = await signInWithPopup(auth!, provider);
      const user = result.user;
      const userData: UserData = {
        uid: user.uid,
        email: user.email || `${user.uid}@${providerType}.com`,
        displayName: user.displayName || user.email?.split('@')[0] || `User-${user.uid}`,
        name: user.displayName || user.email?.split('@')[0] || `User-${user.uid}`,
        balance: 0,
        avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email?.split('@')[0] || `User-${user.uid}`)}&background=random`,
        provider: providerType,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        loginCount: 1,
        ipAddress: options.ipAddress,
        status: 'active',
      };
      const response = await fetch('/api/get-user', {
        method: 'GET',
        headers: { 'X-User-ID': user.uid },
      });
      const existingUser = await response.json();
      if (existingUser.data) {
        userData.balance = existingUser.data.balance || 0;
        userData.createdAt = existingUser.data.createdAt;
        userData.loginCount = (existingUser.data.loginCount || 0) + 1;
      }
      await userManager.setUser(userData);
      const message = `👤 <b>${userData.name}</b> đã đăng nhập bằng ${providerType}<br>📧 Email: ${userData.email}<br>🌐 IP: ${options.ipAddress}<br>📱 Thiết bị: ${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await Promise.all([
        fetch('/api/send-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/save-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: `user_login_${providerType}`,
            title: `Đăng nhập thành công qua ${providerType}`,
            message,
            user: { email: userData.email, name: userData.name },
            timestamp: new Date().toISOString(),
            device: `${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})`,
            ip: options.ipAddress,
          }),
        }),
      ]);
      return { user, error: null };
    }
  } catch (error: any) {
    console.error(`Firebase ${providerType} auth failed:`, error);
    return { user: null, error: `Không thể đăng nhập bằng ${providerType}!` };
  }

  // Fallback to localStorage
  try {
    const response = await fetch('/api/sign-in-social-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerType, ...options }),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error(`Fallback ${providerType} auth failed:`, error);
    return { user: null, error: `Không thể đăng nhập bằng ${providerType}!` };
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
    console.error('Sign out failed:', error);
    return { error: error.message || 'Không thể đăng xuất!' };
  }
};

export const changePassword = async (
  email: string,
  currentPassword: string,
  newPassword: string,
  options: { deviceInfo: { deviceType: string; browser: string; os: string }; ipAddress: string }
): Promise<{ success: boolean; error: string | null }> => {
  try {
    if (isFirebaseConfigured() && auth!.currentUser) {
      if (currentPassword) {
        await signInWithEmailAndPassword(auth!, email, currentPassword);
      }
      await updateProfile(auth!.currentUser, { password: newPassword });
      const message = `🔑 <b>${email}</b> đã đổi mật khẩu<br>🌐 IP: ${options.ipAddress}<br>📱 Thiết bị: ${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await Promise.all([
        fetch('/api/send-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/save-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'change_password',
            title: 'Đổi mật khẩu',
            message,
            user: { email, name: auth!.currentUser.displayName || 'User' },
            timestamp: new Date().toISOString(),
            device: `${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})`,
            ip: options.ipAddress,
          }),
        }),
      ]);
      return { success: true, error: null };
    }
  } catch (error: any) {
    console.error('Firebase change password failed:', error);
  }

  // Fallback to localStorage and MySQL
  try {
    const response = await fetch('/api/change-password-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, currentPassword, newPassword, ...options }),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Change password error:', error);
    return { success: false, error: error.message || 'Đã xảy ra lỗi khi đổi mật khẩu!' };
  }
};

export const requestPasswordReset = async (
  email: string,
  options: { deviceInfo: { deviceType: string; browser: string; os: string }; ipAddress: string }
): Promise<{ success: boolean; error: string | null; token?: string }> => {
  try {
    const response = await fetch('/api/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...options }),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Request password reset error:', error);
    return { success: false, error: error.message || 'Đã xảy ra lỗi khi gửi yêu cầu đổi mật khẩu!' };
  }
};

// Admin functions
export const adminLogin = async (
  email: string,
  password: string,
  options: { deviceInfo: { deviceType: string; browser: string; os: string }; ipAddress: string }
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const response = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...options }),
    });
    const result = await response.json();
    
    if (result.success && typeof window !== 'undefined') {
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem(
        'adminUser',
        JSON.stringify({
          email: email,
          name: 'Admin',
          role: 'admin',
          loginTime: new Date().toISOString(),
        })
      );
    }
    
    return result;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return { success: false, error: 'Thông tin đăng nhập không chính xác!' };
  }
};

export const adminLoginWithSocialProvider = async (
  providerType: 'google' | 'facebook' | 'github',
  options: { deviceInfo: { deviceType: string; browser: string; os: string }; ipAddress: string }
): Promise<{ success: boolean; error: string | null }> => {
  let provider;
  switch (providerType) {
    case 'google':
      provider = new GoogleAuthProvider();
      break;
    case 'facebook':
      provider = new FacebookAuthProvider();
      break;
    case 'github':
      provider = new GithubAuthProvider();
      break;
    default:
      return { success: false, error: 'Invalid provider' };
  }

  try {
    if (isFirebaseConfigured()) {
      const result = await signInWithPopup(auth!, provider);
      const user = result.user;
      const adminEmails = [process.env.ADMIN_EMAIL].filter(Boolean);
      if (!adminEmails.includes(user.email)) {
        await signOut(auth!);
        return { success: false, error: 'Tài khoản này không có quyền admin!' };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem(
          'adminUser',
          JSON.stringify({
            email: user.email,
            name: user.displayName || 'Admin',
            role: 'admin',
            loginTime: new Date().toISOString(),
          })
        );
      }
      const message = `👑 <b>Admin ${user.email}</b> đã đăng nhập bằng ${providerType}<br>🌐 IP: ${options.ipAddress}<br>📱 Thiết bị: ${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await Promise.all([
        fetch('/api/send-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        }),
        fetch('/api/save-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: `admin_login_${providerType}`,
            title: `Admin đăng nhập qua ${providerType}`,
            message,
            admin: {
              email: user.email || '',
              name: user.displayName || 'Admin',
              loginTime: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
            device: `${options.deviceInfo.deviceType} (${options.deviceInfo.browser}, ${options.deviceInfo.os})`,
            ip: options.ipAddress,
          }),
        }),
      ]);
      return { success: true, error: null };
    }
  } catch (error: any) {
    console.error(`Firebase admin ${providerType} login failed:`, error);
    return { success: false, error: `Không thể đăng nhập admin bằng ${providerType}!` };
  }

  return { success: false, error: 'Firebase không được cấu hình!' };
};

export const adminLogout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
  }
};

export const getAdminUser = (): { email: string; name: string; role: string; loginTime: string } | null => {
  if (typeof window !== 'undefined') {
    const admin = localStorage.getItem('adminUser');
    return admin ? JSON.parse(admin) : null;
  }
  return null;
};

export const isAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adminAuth') === 'true';
};

// Real-time listeners
export const onNotificationsChange = (callback: (notifications: Notification[]) => void): (() => void) => {
  const loadFromStorage = () => {
    if (typeof window !== 'undefined') {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      callback(notifications);
    }
  };

  try {
    if (isFirebaseConfigured()) {
      const q = query(collection(db!, 'notifications'), orderBy('timestamp', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
        callback(notifications);
      });
    } else {
      loadFromStorage();
    }
  } catch (error) {
    console.error('Firestore notifications listener failed:', error);
    loadFromStorage();
  }

  return () => {};
};

// Compatibility exports
export const getCurrentUser = userManager.getUser;
export const isAuthenticated = userManager.isLoggedIn;

// Export Firebase auth providers
export { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider };