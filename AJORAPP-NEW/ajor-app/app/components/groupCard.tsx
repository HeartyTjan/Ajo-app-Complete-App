import styles from "@/app/styles/groups.styles";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Feather } from "@expo/vector-icons";

interface Group {
  name: string;
  status: string;
  description: string;
  amount: number;
  yet_to_collect_members: any[];
  already_collected_members: any[];
  collection_deadline: string;
}

const GroupCard = ({ group, walletBalance }: { group: Group; walletBalance: number }) => {

  const numberOfMembers =
    (group.yet_to_collect_members?.length || 0) +
    (group.already_collected_members?.length || 0);

  const amountPerMember = group.amount;
  const goal = group.amount * numberOfMembers;
  const saved = walletBalance || 0;
  const percentage = goal > 0 ? ((saved / goal) * 100).toFixed(1) : "0";
  const progressWidth = Math.max(0, Math.min(100, parseFloat(percentage)));

  return (
    <View style={styles.groupCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.groupTitle}>{group.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{group.status}</Text>
        </View>
      </View>

      <Text style={styles.groupDescription}>{group.description}</Text>

      <View style={styles.progressRow}>
        <Text style={styles.amountText}>Per member: ₦{amountPerMember?.toLocaleString()}</Text>
        <Text style={styles.amountText}>Goal: ₦{goal.toLocaleString()}</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progressWidth}%`, backgroundColor: "#0f766e" },
          ]}
        />
      </View>
      <Text style={styles.percentText}>{saved.toLocaleString()} saved / {goal.toLocaleString()} ({percentage}% completed)</Text>

      <View style={styles.detailsRow}>
        <Text style={styles.infoText}>
          <FontAwesome5 name="user-friends" size={14} /> {numberOfMembers} members
        </Text>
        <Text style={styles.infoText}>
          <Feather name="calendar" size={14} />{" "}
          {new Date(group.collection_deadline).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>
    </View>
  );
};
export default GroupCard;
