type Props = {
  src: string;
};

export const MessageImage = (props: Props) => <img class="w-full max-w-[487px] rounded-[16px] object-cover" src={props.src} alt="" />;
