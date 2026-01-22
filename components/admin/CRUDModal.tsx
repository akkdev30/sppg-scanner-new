// components/admin/CRUDModal.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FormField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "phone" | "password" | "radio";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}

interface CRUDModalProps {
  visible: boolean;
  title: string;
  fields: FormField[];
  formData: any;
  onFieldChange: (name: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function CRUDModal({
  visible,
  title,
  fields,
  formData,
  onFieldChange,
  onSubmit,
  onCancel,
  isEdit = false,
}: CRUDModalProps) {
  const renderField = (field: FormField) => {
    if (field.type === "radio" && field.options) {
      return (
        <View style={styles.formGroup} key={field.name}>
          <Text style={styles.formLabel}>
            {field.label} {field.required && "*"}
          </Text>
          <View style={styles.radioGroup}>
            {field.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => onFieldChange(field.name, option.value)}
              >
                <View style={styles.radioCircle}>
                  {formData[field.name] === option.value && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    const inputProps: any = {
      style:
        field.type === "textarea"
          ? [styles.formInput, styles.textArea]
          : styles.formInput,
      value: formData[field.name] || "",
      onChangeText: (text: string) => onFieldChange(field.name, text),
      placeholder: field.placeholder,
    };

    if (field.type === "number") {
      inputProps.keyboardType = "numeric";
    } else if (field.type === "phone") {
      inputProps.keyboardType = "phone-pad";
    } else if (field.type === "password") {
      inputProps.secureTextEntry = true;
      inputProps.autoCapitalize = "none";
    } else if (field.type === "textarea") {
      inputProps.multiline = true;
      inputProps.numberOfLines = 3;
      inputProps.textAlignVertical = "top";
    }

    return (
      <View style={styles.formGroup} key={field.name}>
        <Text style={styles.formLabel}>
          {field.label} {field.required && "*"}
        </Text>
        <TextInput {...inputProps} />
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {fields.map((field) => renderField(field))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Text style={styles.submitButtonText}>
                {isEdit ? "Update" : "Simpan"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  radioLabel: {
    fontSize: 14,
    color: "#374151",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});
