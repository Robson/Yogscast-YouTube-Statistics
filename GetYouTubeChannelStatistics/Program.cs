//--------------------------------------------------------------//
// Program.cs
//
// Written by Robson
// <https://robson.plus>
//
// See the GitHub repository for licensing information.
// <http://github.com/robson>
//--------------------------------------------------------------//

namespace GetYouTubeChannelStatistics
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text.Json;
    using System.Threading;
    using System.Xml;
    using Google.Apis.Services;
    using Google.Apis.YouTube.v3;

    internal class Program
    {        
        private const string PlaylistId = "UUH-_hzb2ILSCo9ftVSnrCIQ"; // yogscast "all videos" playlist. this id is public
        private const int YearStart = 2020;
        private const int YearFinal = 2020;
        private const int MaxVideoMetaDataResults = 50; // this is the maximum that the API allows

        private static string apiKey = File.ReadAllText("key.txt"); // to be able to use this code, you will need to replace this with your own key        
        private static List<string> videoIds = new List<string>();
        private static List<VideoData> videoDatas = new List<VideoData>();
        private static YouTubeService ytService = new YouTubeService(new BaseClientService.Initializer { ApiKey = apiKey });

        internal static void Main()
        {
            GetVideoIds();
            GetVideoDetails();
            SetSingleEpisodeSeries();
            WriteJson();
        }

        private static void GetVideoIds()
        {
            var service = ytService.PlaylistItems.List("contentDetails");
            service.MaxResults = MaxVideoMetaDataResults;
            service.PlaylistId = PlaylistId;

            var isFinished = false;
            do
            {
                var results = service.Execute();
                foreach (var video in results.Items)
                {
                    // not y10k safe
                    var year = int.Parse(video.ContentDetails.VideoPublishedAt.Substring(0, 4));
                    if (year < YearStart)
                    {
                        isFinished = true;
                        break;
                    }
                    else if (year >= YearStart && year <= YearFinal)
                    {
                        videoIds.Add(video.ContentDetails.VideoId);
                    }
                }

                if (!isFinished)
                {
                    var nextPageToken = results.NextPageToken;
                    service.PageToken = nextPageToken;
                }                
            }
            while (!isFinished);

            // just pause, so we don't overload the API with queries and then get blocked
            Thread.Sleep(1000);
        }

        private static void GetVideoDetails()
        {
            // there's lots of other details available, but we don't need those
            var service = ytService.Videos.List("contentDetails,snippet,statistics");

            for (int i = 0; i < videoIds.Count(); i += MaxVideoMetaDataResults)
            {
                service.Id = string.Join(",", videoIds.Skip(i).Take(MaxVideoMetaDataResults));
                foreach (var video in service.Execute().Items)
                {
                    var videoData = new VideoData
                    {
                        Id = video.Id,
                        PublishedDate = video.Snippet.PublishedAt,
                        Title = video.Snippet.Title,
                        Description = video.Snippet.Description,
                        LengthInSeconds = (long)XmlConvert.ToTimeSpan(video.ContentDetails.Duration).TotalSeconds,
                        CountViews = video.Statistics.ViewCount ?? 0,
                        CountLikes = video.Statistics.LikeCount ?? 0,
                        CountDislikes = video.Statistics.DislikeCount ?? 0,
                        CountComments = video.Statistics.CommentCount ?? 0,
                        Tags = video.Snippet.Tags == null ? string.Empty : string.Join(",", video.Snippet.Tags)
                    };

                    videoData.PercentLikes = decimal.Round((decimal)videoData.CountLikes / (decimal)(videoData.CountLikes + videoData.CountDislikes), 5);
                    videoData.Series = DetermineSeries(videoData);
                    videoDatas.Add(videoData);
                }
            }

            // just pause, so we don't overload the API with queries and then get blocked
            Thread.Sleep(1000);
        }

        private static string DetermineSeries(VideoData vd)
        {
            var title = vd.Title.ToLower();
            var tags = vd.Tags.ToLower();

            if (title.Contains("unfortunate spacemen"))
            {
                return "Unfortunate Spacemen";
            }

            if (title.Contains("but it's gmod ttt") ||
                title.Contains("in gmod ttt"))
            {
                return "Gmod TTT";
            }

            if (title.Contains("among us"))
            {
                return "Among Us";
            }

            if (title.Contains("gmod build"))
            {
                return "Gmod Build";
            }

            if (title.Contains("gmod ttt"))
            {
                return "Gmod TTT";
            }

            if (title.Contains("gmod dupes"))
            {
                return "Gmod Dupes";
            }

            if (title.Contains("voltz in gmod"))
            {
                return "Gmod Voltz";
            }

            if (title.Contains("journey to the savage planet"))
            {
                return "Journey to the Savage Planet";
            }

            if (tags.Contains("ai dungeon") ||
                tags.Contains("a.i. dungeon"))
            {
                return "A.I. Dungeon";
            }

            if (title.Contains("drink more glurp"))
            {
                return "Drink More Glurp";
            }

            if (title.Contains("gta 5"))
            {
                return "GTA 5";
            }

            if (title.Contains("yogscast game jam"))
            {
                return "Yogscast Game Jam";
            }

            if (title.Contains("ar portions") ||
                tags.Contains("peculiar portions") ||
                tags.Contains("internet news"))
            {
                return "Simon's Peculiar Portions";
            }

            if (title.Contains("animal crossing"))
            {
                return "Animal Crossing";
            }

            if (title.Contains("fighting fantasy"))
            {
                return "Fighting Fantasy";
            }

            if (title.Contains("minecraft"))
            {
                return "Minecraft";
            }

            if (title.Contains("jingle") ||
                title.Contains("million for charity"))
            {
                return "Jingle Jam";
            }

            if (title.Contains("borderlands 3"))
            {
                return "Borderlands 3";
            }

            if (title.Contains("xcom"))
            {
                return "XCOM";
            }

            if (title.Contains("phasmophobia"))
            {
                return "Phasmophobia";
            }

            if (title.Contains("yogscast poker"))
            {
                return "Poker";
            }

            if (title.Contains("struggling"))
            {
                return "Struggling";
            }

            if (title.Contains("yogpod") &&
                title.Contains("animated"))
            {
                return "YoGPoD Animated";
            }

            if (title.Contains("best christmas song"))
            {
                return "Music";
            }

            throw new Exception("Could not determine the series for this video!");
        }

        private static void SetSingleEpisodeSeries()
        {
            foreach (var video in videoDatas)
            {
                var amount = videoDatas.Count(a => a.Series == video.Series);
                video.IsSingleEpisodeSeries = amount == 1;
            }
        }

        private static void WriteJson()
        {
            var json = JsonSerializer.Serialize<VideoData[]>(videoDatas.ToArray(), new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText("data.json", "var stats = " + json);
        }

        internal class VideoData
        {
            public string Id { get; set; }

            public string PublishedDate { get; set; }

            public string Title { get; set; }

            public long LengthInSeconds { get; set; }

            public ulong CountViews { get; set; }

            public ulong CountLikes { get; set; }

            public ulong CountDislikes { get; set; }

            public ulong CountComments { get; set; }

            public decimal PercentLikes { get; set; }

            public string Series { get; set; }

            public bool IsSingleEpisodeSeries { get; set; }

            internal string Description { get; set; }

            internal string Tags { get; set; }
        }
    }
}