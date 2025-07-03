import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f7faff",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationIcon: {
    paddingRight: 5,
    paddingVertical: 8,
    backgroundColor: "transparent", // or '#fff' if on white background
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeSection: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    color: "#555",
    fontSize: 14,
  },
  overview: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  green: {
    backgroundColor: "#ebfff5",
  },
  blue: {
    backgroundColor: "#f0f4ff",
  },
  pink: {
    backgroundColor: "#fff1f5",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    backgroundColor: "#0f766e",
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    color: "#333",
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  badge: {
    backgroundColor: "#ccfbf1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    color: "#047857",
    fontWeight: "600",
  },

  quickActionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#555",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 20,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  activityTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  activityTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  amount: {
    fontWeight: "600",
    fontSize: 14,
  },
});
export default styles;
