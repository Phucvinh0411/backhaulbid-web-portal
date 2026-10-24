import { useState } from "react";
import { addressBookApi } from "@/services/addressBookApi";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { getApiErrorMessage } from "@/services/errorMessage";
import { addressBookPayloadFromPlace, isCompletePlace } from "../../routePlace";

const PHONE_REGEX = /^[0-9 .()+-]{8,30}$/;

export function useSaveToAddressBook() {
  const notify = useGlobalNotification();
  const [savingTarget, setSavingTarget] = useState(null);

  const save = async (target, place, contact) => {
    const isFrom = target === "FROM";
    const pointLabel = isFrom ? "Điểm Nhận (A)" : "Điểm Giao (B)";

    if (!isCompletePlace(place)) {
      notify.warning(`Vui lòng chọn địa chỉ ${pointLabel} trước khi lưu.`);
      return;
    }

    const contactName = contact?.contactName?.trim();
    if (!contactName) {
      notify.warning(`Vui lòng nhập tên người liên hệ tại ${pointLabel} trước khi lưu vào sổ địa chỉ.`);
      return;
    }

    const contactPhone = contact?.contactPhone?.trim();
    if (!contactPhone || !PHONE_REGEX.test(contactPhone)) {
      notify.warning(`Vui lòng nhập số điện thoại người liên hệ hợp lệ (8 - 30 ký tự số) tại ${pointLabel} trước khi lưu.`);
      return;
    }

    setSavingTarget(target);
    try {
      await addressBookApi.create(addressBookPayloadFromPlace(place, { contactName, contactPhone }));
      notify.success(`Đã lưu "${place.locationName}" vào Sổ địa chỉ kho thành công!`);
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Không thể lưu địa chỉ vào sổ kho."));
    } finally {
      setSavingTarget(null);
    }
  };

  return { save, savingTarget };
}
