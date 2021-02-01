//--------------------------------------------------------------//
// SeriesParserYogscast.cs
//
// Written by Robson
// <https://robson.plus>
//
// See the GitHub repository for licensing information.
// <https://github.com/Robson/Yogscast-YouTube-Statistics>
//--------------------------------------------------------------//

namespace GetYouTubeChannelStatistics
{
    internal static class SeriesParserYogscast
    {
        internal static string DetermineSeries(VideoData vd)
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

            throw new System.Exception("Could not determine the series for this video!");
        }
    }
}
