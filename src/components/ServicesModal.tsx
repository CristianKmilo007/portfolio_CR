import React from "react";
import CustomModalHeroUI from "./CustomModalHeroUI";
import { TbPointFilled } from "react-icons/tb";

interface ServicesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: Array<string>;
}

const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onOpenChange,
  items,
}) => {
  return (
    <CustomModalHeroUI
      size="md"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      headerContent={<h3 className="text-white text-xl">Servicios</h3>}
    >
      <div className="flex flex-col gap-3 font-crimson italic text-white pb-2">
        {items.map((item) => (
          <div className="flex gap-2" key={item}>
            <TbPointFilled className="mt-1 size-3 min-w-3" />
            <span className="text-lg leading-6">{item}</span>
          </div>
        ))}
      </div>
    </CustomModalHeroUI>
  );
};

export default ServicesModal;
