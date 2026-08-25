'use client';

import styled from "styled-components";
import Image from "next/image";
import colors from "@/lib/colors";

const Wrapper = styled.div<{ $size: number }>`
  position: relative;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  overflow: hidden;
  flex: none;
  background: ${colors.buttonPurple};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.normalWhite};
  font-weight: 700;
`;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function MentorAvatar({
  name,
  photoUrl,
  size = 60,
}: {
  name: string;
  photoUrl: string | null;
  size?: number;
}) {
  if (photoUrl) {
    return (
      <Wrapper $size={size}>
        <Image src={photoUrl} alt={name} fill style={{ objectFit: "cover" }} />
      </Wrapper>
    );
  }
  
  return (
    <Wrapper $size={size} style={{ fontSize: size * 0.35 }}>
      {getInitials(name)}
    </Wrapper>
  );

}