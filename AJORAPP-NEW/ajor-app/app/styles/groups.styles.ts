import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  inputsearch: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    height: 48,
    fontSize: 16,
    color: "#000",
  },

  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#000", // text color
  },
  //   input: {
  //   borderColor: "#ccc",
  //   borderWidth: 1,
  //   borderRadius: 8,
  // },
  createButton: {
    backgroundColor: "#0f766e",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  createText: {
    color: "#fff",
    fontWeight: "bold",
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 2,
  },
  // label: {
  //   color: "#6b7280",
  //   fontSize: 12,
  // },
  value: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 100,
  },
  groupCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: "#15803d",
  },
  groupDescription: {
    color: "#6b7280",
    marginVertical: 4,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  amountText: {
    fontSize: 12,
    color: "#374151",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  percentText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#374151",
  },

  joinBox: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#374151",
  },
  joinButton: {
    marginTop: 10,
    backgroundColor: "#0f766e",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default styles;
