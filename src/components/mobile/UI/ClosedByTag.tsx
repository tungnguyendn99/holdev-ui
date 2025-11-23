import { Tag } from 'antd';

export const handleClosedBy = (closedBy: string | undefined) => {
  switch (closedBy) {
    case 'SL':
    case 'SO':
      return (
        <Tag color="red" className="text-[12px]! font-bold px-2! py-px! rounded-md! leading-none!">
          {closedBy}
        </Tag>
      );
    case 'TP':
      return (
        <Tag
          color="green"
          className="text-[12px]! font-bold px-2! py-px! rounded-md! leading-none!"
        >
          {closedBy}
        </Tag>
      );
    case 'MA':
      return (
        <Tag
          color="geekblue"
          className="text-[12px]! font-bold px-2! py-px! rounded-md! leading-none!"
        >
          {closedBy}
        </Tag>
      );
    case 'BE':
      return (
        <Tag
          color="yellow"
          className="text-[12px]! font-bold px-2! py-px! rounded-md! leading-none!"
        >
          {closedBy}
        </Tag>
      );
    default:
      return null;
  }
};

export const handleClosedByDesktop = (closedBy: string | undefined) => {
  switch (closedBy) {
    case 'SL':
    case 'SO':
      return (
        <Tag color="red" className="text-[14px]! font-bold px-2! py-px! rounded-md! leading-none!">
          {closedBy}
        </Tag>
      );
    case 'TP':
      return (
        <Tag
          color="green"
          className="text-[14px]! font-bold px-2! py-px! rounded-md! leading-none!"
        >
          {closedBy}
        </Tag>
      );
    case 'MA':
      return (
        <Tag
          color="geekblue"
          className="text-[14px]! font-bold px-2! py-px! rounded-md! leading-none!"
        >
          {closedBy}
        </Tag>
      );
    case 'BE':
      return (
        <Tag color="gold" className="text-[14px]! font-bold px-2! py-px! rounded-md! leading-none!">
          {closedBy}
        </Tag>
      );
    default:
      return null;
  }
};
