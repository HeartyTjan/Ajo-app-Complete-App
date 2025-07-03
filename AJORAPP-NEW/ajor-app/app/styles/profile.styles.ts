import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  header: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
    backgroundColor: "#0f766e",
  },
  avatar: {
    backgroundColor: "#a78bfa",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  username: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  verified: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 12,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  card: {
    backgroundColor: "#fff",
    width: width * 0.45,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    color: "#374151",
    fontSize: 14,
  },
  money: {
    fontSize: 20,
    color: "#22c55e",
    fontWeight: "bold",
    marginTop: 4,
  },
  groups: {
    fontSize: 20,
    color: "#3b82f6",
    fontWeight: "bold",
    marginTop: 4,
  },
  aboutSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  aboutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  aboutText: {
    color: "#374151",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    color: "#374151",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 15,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuIcon: {
    width: 36,
    alignItems: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: 60,
  },
});

export default styles;
