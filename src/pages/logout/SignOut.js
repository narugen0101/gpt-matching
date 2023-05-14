// signOut.js
import { auth } from "../../firebaseConfig";

export const doSignOut = async () => {
  try {
    await auth.signOut();
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};
