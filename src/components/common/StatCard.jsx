import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "#1B4965" }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="!p-5">
        <Box className="flex items-start justify-between">
          <Box>
            <Typography variant="body2" className="!text-slate-500 !text-[0.8rem] !mb-1">
              {title}
            </Typography>
            <Typography variant="h4" className="!font-bold !text-slate-800">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" className="!text-slate-400 !mt-1 block">
                {subtitle}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box
              className="flex items-center justify-center w-11 h-11 rounded-xl"
              sx={{ backgroundColor: `${color}14` }}
            >
              <Icon sx={{ color, fontSize: 22 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
