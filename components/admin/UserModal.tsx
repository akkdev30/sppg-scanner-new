import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SPPGSelectorModal from "./SPPGSelectorModal";

interface UserItem {
  id: string;
  username: string;
  role: "admin" | "pic";
}

interface SPPGOption {
  id: string;
  sppg_name: string;
  address?: string;
}

interface UserModalProps {
  visible: boolean;
  editItem: UserItem | null;
  sppgList: SPPGOption[];
  onClose: () => void;
  onSubmit: (payload: any) => void;
}

export default function UserModal({
  visible,
  editItem,
  sppgList,
  onClose,
  onSubmit,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "pic" as "admin" | "pic",
    full_name: "",
    email: "",
    phone_number: "",
    school_pic_id: "",
    is_active: true,
  });

  const [showSPPGModal, setShowSPPGModal] = useState(false);

  useEffect(() => {
    if (!visible) return;

    if (editItem) {
      setFormData((prev) => ({
        ...prev,
        username: editItem.username,
        role: editItem.role,
        password: "",
        confirmPassword: "",
      }));
    } else {
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        role: "pic",
        full_name: "",
        email: "",
        phone_number: "",
        school_pic_id: "",
        is_active: true,
      });
    }
  }, [visible, editItem]);

  const handleSubmit = () => {
    const password = formData.password.trim();
    const confirm = formData.confirmPassword.trim();

    if (!formData.username.trim()) {
      Alert.alert("Error", "Username wajib diisi");
      return;
    }

    if (!editItem) {
      if (!password) {
        Alert.alert("Error", "Password wajib diisi");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter");
        return;
      }
      if (password !== confirm) {
        Alert.alert("Error", "Password tidak cocok");
        return;
      }
    }

    if (editItem && password) {
      if (password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter");
        return;
      }
      if (password !== confirm) {
        Alert.alert("Error", "Password tidak cocok");
        return;
      }
    }

    if (formData.role === "pic" && !formData.school_pic_id) {
      Alert.alert("Error", "SPPG wajib dipilih untuk role PIC");
      return;
    }

    const payload: any = {
      username: formData.username.trim(),
      role: formData.role,
      full_name: formData.full_name || null,
      email: formData.email || null,
      phone_number: formData.phone_number || null,
      school_pic_id: formData.role === "pic" ? formData.school_pic_id : null,
      is_active: formData.is_active,
    };

    if (!editItem || password) {
      payload.password = password;
    }

    onSubmit(payload);
  };

  const selectedSPPG = sppgList.find((s) => s.id === formData.school_pic_id);

  return (
    <>
      <Modal transparent visible={visible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>
                {editItem ? "Edit User" : "Tambah User"}
              </Text>

              <Input
                label="Username *"
                value={formData.username}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, username: v })
                }
              />

              <Input
                label={`Password ${editItem ? "(opsional)" : "*"}`}
                secure
                value={formData.password}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, password: v })
                }
              />

              {(!editItem || formData.password) && (
                <Input
                  label="Konfirmasi Password"
                  secure
                  value={formData.confirmPassword}
                  onChangeText={(v: string) =>
                    setFormData({ ...formData, confirmPassword: v })
                  }
                />
              )}

              <Input
                label="Nama Lengkap"
                value={formData.full_name}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, full_name: v })
                }
              />

              <Input
                label="Email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, email: v })
                }
              />

              <Input
                label="No. Telepon"
                keyboardType="phone-pad"
                value={formData.phone_number}
                onChangeText={(v: string) =>
                  setFormData({ ...formData, phone_number: v })
                }
              />

              <View style={styles.roleRow}>
                <Text style={styles.label}>Role</Text>
                <View style={{ flexDirection: "row" }}>
                  {["admin", "pic"].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.roleBtn,
                        formData.role === r && styles.roleActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, role: r as any })
                      }
                    >
                      <Text>{r.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {formData.role === "pic" && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>SPPG *</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowSPPGModal(true)}
                  >
                    <Text>
                      {selectedSPPG ? selectedSPPG.sppg_name : "Pilih SPPG"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.switchRow}>
                <Text>Aktif</Text>
                <Switch
                  value={formData.is_active}
                  onValueChange={(v) =>
                    setFormData({ ...formData, is_active: v })
                  }
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.cancel}>
                <Text>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.submit}>
                <Text style={{ color: "white" }}>
                  {editItem ? "Update" : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SPPGSelectorModal
        visible={showSPPGModal}
        sppgList={sppgList}
        selectedId={formData.school_pic_id}
        onSelect={(id) => setFormData({ ...formData, school_pic_id: id })}
        onClose={() => setShowSPPGModal(false)}
      />
    </>
  );
}

/* ===== Input Helper ===== */
function Input({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ marginBottom: 6 }}>{label}</Text>
      <TextInput
        {...props}
        secureTextEntry={props.secure}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    maxHeight: "92%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  roleRow: {
    marginTop: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  roleActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  submit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
});
