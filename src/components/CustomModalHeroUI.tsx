// CustomModalNextUI.tsx
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

type CustomModalProps = {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  hideCloseButton?: boolean;
  size?:
    | "2xl"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "xs"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full"
    | undefined;
  placement?:
    | "center"
    | "auto"
    | "top"
    | "top-center"
    | "bottom"
    | "bottom-center";
  scrollBehavior?: "normal" | "inside" | "outside";
  isDismissable?: boolean;
  classNames?: Record<
    | "wrapper"
    | "base"
    | "backdrop"
    | "header"
    | "body"
    | "footer"
    | "closeButton",
    string
  >;
  closeButton?: React.ReactNode;
};

const CustomModalHeroUI: React.FC<CustomModalProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  headerContent,
  children,
  footerContent,
  size = "2xl",
  placement = "center",
  scrollBehavior,
  isDismissable,
  classNames,
  hideCloseButton,
  closeButton,
}) => {
  return (
    <Modal
      size={size}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      backdrop={"blur"}
      hideCloseButton={hideCloseButton}
      scrollBehavior={scrollBehavior}
      placement={placement}
      autoFocus={false}
      isDismissable={isDismissable}
      classNames={{
        wrapper: `${classNames?.wrapper} !will-change-auto`,
        base: `${classNames?.base} p-2 bg-[#222]`,
        backdrop: `${classNames?.backdrop}`,
        header: `${classNames?.header} px-2 sm:px-6`,
        body: `${classNames?.body} px-2 sm:px-6`,
        footer: `${classNames?.footer} px-2 sm:px-6`,
        closeButton: `${classNames?.closeButton}`,
      }}
      closeButton={closeButton}
    >
      <ModalContent>
        {() => (
          <>
            {headerContent && (
              <ModalHeader className="flex flex-col gap-1">
                {headerContent}
              </ModalHeader>
            )}
            <ModalBody>{children}</ModalBody>
            {footerContent && <ModalFooter>{footerContent}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CustomModalHeroUI;
