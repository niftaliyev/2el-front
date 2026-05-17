import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  title?: string;
  iconColor?: string;
  onlyIcon?: boolean;
}

export const VipIcon: React.FC<IconProps> = ({ size = 24, className, title, iconColor = "white", onlyIcon = false, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {title && <title>{title}</title>}
    {!onlyIcon && <path d="M6 4H18L22 12L12 22L2 12L6 4Z" fill="#FF4F08"/>}
    <path d="M12 17L15 10H13.2L12 13.2L10.8 10H9L12 17Z" fill={onlyIcon ? (props.fill || iconColor) : "white"}/>
  </svg>
);

export const PremiumIcon: React.FC<IconProps> = ({ size = 24, className, title, iconColor = "#FF9D00", ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {title && <title>{title}</title>}
    <path d="M4 7L7 19H17L20 7L15 11L12 4L9 11L4 7Z" fill={props.fill || iconColor}/>
  </svg>
);
