import { StyleSheet } from "react-native";
import { COLORS } from "../../../constants/theme";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: "center",
    marginTop: 7,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  primaryButton: {
    height: 48,
    backgroundColor: "#0f766e",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    alignSelf: "flex-end",
    marginBottom: 32,
  },
  linkText: {
    color: "#0f766e",
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  loginSection: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  //   googleButtonText: {
  //     fontSize: 16,
  //     color: "#333",
  //   },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -20,
  },
  footerText: {
    color: "#666",
  },
  footerLink: {
    color: "#0f766e",
    fontWeight: "600",
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  termsText: {
    flex: 1,
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },

  termLink: {
    color: COLORS.surface,
    fontWeight: "500",
  },

  //   primaryButton: {
  //     backgroundColor: COLORS.primary,
  //     padding: 14,
  //     borderRadius: 12,
  //     alignItems: "center",
  //   },

  //   primaryButtonText: {
  //     color: "#fff",
  //     fontSize: 16,
  //     fontWeight: "600",
  //   },

  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.surface,
  },
});

export default styles;
