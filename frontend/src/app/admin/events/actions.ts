import { private_api_call } from "@/actions/parivate_api_calll";
import { CalendarEvent } from "@/components/FullCalandar";

const getColorByStatus = (status: string): CalendarEvent["color"] => {
    switch (status) {
        case "published":
            return "green";
        case "scheduled":
            return "blue";
        case "failed":
            return "pink";
        case "draft":
            return "default";
        default:
            return "default";
    }
};

type ApiPost = {
  id: string;
  content: string;
  status: string;
  asset_type: string;
  event_date: string;
  media_count: number;
  asset_id?: string;
  asset_name?: string;
  asset_url?: string;
};
        
const api_adapter = (data: ApiPost): CalendarEvent => {
    return {
      id: data.id,
      content: data.content,
      title: data.asset_type == "facebook_page" ? `Post on Facebook` : "Post on Instagram",
      status: data.status,
      start: new Date(data.event_date),
      end: new Date(new Date(data.event_date).getTime() + 30*60 * 1000),
      media_count: data.media_count,
      asset_id: data?.asset_id ? data.asset_id : "1",
      asset_type: data?.asset_type ? data.asset_type : "facebook_page",
      asset_name: data?.asset_name ? data.asset_name : "Dummy",
      asset_url: data?.asset_url ? data.asset_url : "",
      color: getColorByStatus(data.status),
    };
};

const getStartEndDates = (view: string): { start: Date, end: Date } => {
    const today = new Date();

let start= new Date();
let end= new Date();

switch (view) {
  case "day":
    start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    break;

  case "week":
    const firstDay = today.getDate() - today.getDay();

    start = new Date(
      today.getFullYear(),
      today.getMonth(),
      firstDay
    );

    end = new Date(
      today.getFullYear(),
      today.getMonth(),
      firstDay + 7
    );
    break;

  case "month":
    start = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    end = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1
    );
    break;

  case "year":
    start = new Date(today.getFullYear(), 0, 1);
    end = new Date(today.getFullYear() + 1, 0, 1);
    break;
    }
    console.log(`Start: ${start.toISOString()}, End: ${end.toISOString()}`);
    return { start, end };
};
export const getPosts = async (view: string) => {
    const { start, end } = getStartEndDates(view);
   
    const response = await private_api_call({
        path: "posts?from=" + start.toISOString() + "&to=" + end.toISOString(),
        method: "GET",
    });
    if (response.success) {
      return (response.data as ApiPost[]).map((post) => api_adapter(post));
    } else {
        console.error("Failed to fetch scheduled posts:", response.message);
        return [];
    }
};
    
