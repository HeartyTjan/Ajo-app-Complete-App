type FormErrors = {
  userName?: string;
  email?: string;
  password?: string;
  phone?: string;
  bvn?: string;
  confirmPassword?: string;
};
export default function validateForm(userInfo: any) {
  const errors: FormErrors = {};

  if (!userInfo.userName) errors.userName = "User Name is required";
  else if (userInfo.userName.length < 2) errors.userName = "Name is too short";

  const emailPattern = /\S+@\S+\.\S+/;

  if (!userInfo.email) {
    errors.email = "Email is required";
  } else if (!emailPattern.test(userInfo.email)) {
    errors.email = "Email is invalid";
  }

  if (!userInfo.phone) {
    errors.phone = "Phone number is required";
  } else if (userInfo.phone.length !== 11) {
    errors.phone = "Phone number must be 11 digits";
  }

  if (!userInfo.bvn) {
    errors.bvn = "BVN is required";
  } else if (userInfo.bvn.length !== 11) {
    errors.bvn = "BVN must be 11 digits";
  }
  if (!userInfo.password) {
    errors.password = "Password is required";
  } else if (userInfo.password.length < 8 ||
    !/[A-Z]/.test(userInfo.password) ||
    !/[a-z]/.test(userInfo.password) ||
    !/[0-9]/.test(userInfo.password) ||
    !/[!@#$%^&*()\-_=+\[\]{}|;:',.<>?/`~\\"]/.test(userInfo.password)
  ) {
    errors.password = "Password must be at least 8 characters and include uppercase, lowercase, digit, and special character";
  }
  return errors;
}
export { FormErrors };
