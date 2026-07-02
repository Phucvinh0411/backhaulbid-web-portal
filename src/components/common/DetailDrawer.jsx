import React from 'react';
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";

export const DetailDrawer = ({ open, onClose, title, children, width = 450 }) => {
  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: { xs: '100%', sm: width },
          borderTopLeftRadius: { xs: 0, sm: '16px' },
          borderBottomLeftRadius: { xs: 0, sm: '16px' }
        }
      }}
    >
      <Box className="flex flex-col h-full bg-slate-50/30">
        <Box className="p-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100">
          <Typography variant="h6" className="font-bold text-[#1B4965]">
            {title}
          </Typography>
          <IconButton 
            onClick={onClose} 
            size="small" 
            className="bg-slate-100 hover:bg-slate-200 text-slate-500"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box className="p-5 flex-1 overflow-y-auto">
          {children}
        </Box>
      </Box>
    </Drawer>
  );
};
