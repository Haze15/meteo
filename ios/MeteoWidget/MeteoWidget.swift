import WidgetKit
import SwiftUI

// MARK: - Données

struct DayForecast: Identifiable {
    let id = UUID()
    let label: String
    let code: Int
    let tmax: Int
    let tmin: Int
}

struct WeatherEntry: TimelineEntry {
    let date: Date
    let place: String
    let temp: Int
    let feels: Int
    let code: Int
    let isDay: Bool
    let unit: String
    let days: [DayForecast]
    var bg: [Color] = []
    var ang: Double = 170
    var ink: Color = .white
}

func hexColor(_ h: String) -> Color? {
    let t = h.replacingOccurrences(of: "#", with: "")
    guard t.count == 6, let n = Int(t, radix: 16) else { return nil }
    return Color(red: Double(n >> 16 & 255) / 255, green: Double(n >> 8 & 255) / 255, blue: Double(n & 255) / 255)
}
func luminance(_ h: String) -> Double {
    let t = h.replacingOccurrences(of: "#", with: "")
    guard let n = Int(t, radix: 16) else { return 0 }
    return (0.299 * Double(n >> 16 & 255) + 0.587 * Double(n >> 8 & 255) + 0.114 * Double(n & 255)) / 255
}

// Même choix de thème que l'écran (engine.js : stateFor)
func themeKey(code k: Int, day: Bool, tempC: Double, gust: Double, wx: [String: Any]) -> String {
    let windG = (wx["windG"] as? Double) ?? 70, blizG = (wx["blizG"] as? Double) ?? 55, heat = (wx["heat"] as? Double) ?? 32
    if k >= 96 { return "hail" }
    if k == 95 { return "storm" }
    if [56, 57, 66, 67].contains(k) { return "sleet" }
    if (71...77).contains(k) || k == 85 || k == 86 { return (k == 75 || k == 86 || gust >= blizG) ? "blizzard" : "snow" }
    if k == 45 || k == 48 { return "fog" }
    if (51...55).contains(k) { return "drizzle" }
    if (61...67).contains(k) || (80...82).contains(k) { return "rain" }
    if gust >= windG { return "wind" }
    if day && tempC >= heat { return "heat" }
    if (wx["frost"] as? Bool ?? true) && tempC <= 0 { return "frost" }
    if !day && k == 3 && (wx["cloudnight"] as? Bool ?? true) { return "cloudnight" }
    return k <= 2 ? (day ? "clear" : "night") : "cloudy"
}

extension WeatherEntry {
    static let placeholder = WeatherEntry(
        date: Date(), place: "Météo", temp: 14, feels: 12, code: 2, isDay: true, unit: "°",
        days: [
            DayForecast(label: "Lun", code: 3, tmax: 15, tmin: 9),
            DayForecast(label: "Mar", code: 61, tmax: 13, tmin: 8),
            DayForecast(label: "Mer", code: 1, tmax: 16, tmin: 7),
            DayForecast(label: "Jeu", code: 0, tmax: 17, tmin: 8),
        ],
        bg: [Color(red: 0.11, green: 0.42, blue: 0.90), Color(red: 0.34, green: 0.69, blue: 1.0), Color(red: 0.75, green: 0.90, blue: 1.0)])
}

func symbol(_ code: Int, day: Bool) -> String {
    switch code {
    case 0: return day ? "sun.max.fill" : "moon.stars.fill"
    case 1, 2: return day ? "cloud.sun.fill" : "cloud.moon.fill"
    case 3: return "cloud.fill"
    case 45, 48: return "cloud.fog.fill"
    case 51, 53, 55, 56, 57: return "cloud.drizzle.fill"
    case 61, 63, 80, 81: return "cloud.rain.fill"
    case 65, 82, 66, 67: return "cloud.heavyrain.fill"
    case 71, 73, 75, 77, 85, 86: return "snowflake"
    case 95, 96, 99: return "cloud.bolt.rain.fill"
    default: return "cloud.fill"
    }
}

func label(_ code: Int) -> String {
    switch code {
    case 0: return "Ciel dégagé"
    case 1: return "Plutôt dégagé"
    case 2: return "Partiellement nuageux"
    case 3: return "Couvert"
    case 45, 48: return "Brouillard"
    case 51, 53, 55: return "Bruine"
    case 56, 57, 66, 67: return "Pluie verglaçante"
    case 61, 63, 80, 81: return "Pluie"
    case 65, 82: return "Forte pluie"
    case 71, 73, 75, 77, 85, 86: return "Neige"
    case 95, 96, 99: return "Orage"
    default: return "—"
    }
}

func colors(_ code: Int, day: Bool) -> [Color] {
    if !day { return [Color(red: 0.07, green: 0.10, blue: 0.22), Color(red: 0.14, green: 0.16, blue: 0.32)] }
    switch code {
    case 0, 1: return [Color(red: 0.16, green: 0.50, blue: 0.90), Color(red: 0.45, green: 0.75, blue: 0.98)]
    case 2, 3, 45, 48: return [Color(red: 0.36, green: 0.46, blue: 0.58), Color(red: 0.60, green: 0.68, blue: 0.76)]
    case 71, 73, 75, 77, 85, 86: return [Color(red: 0.45, green: 0.58, blue: 0.72), Color(red: 0.80, green: 0.88, blue: 0.95)]
    case 95, 96, 99: return [Color(red: 0.18, green: 0.18, blue: 0.30), Color(red: 0.38, green: 0.34, blue: 0.52)]
    default: return [Color(red: 0.25, green: 0.36, blue: 0.52), Color(red: 0.46, green: 0.58, blue: 0.72)]
    }
}

// MARK: - Réseau

struct Loader {
    // Même config que l'écran : lieu et unité lus sur la branche « config »
    static let configURL = URL(string: "https://raw.githubusercontent.com/Haze15/meteo/config/config.json")!

    static func load() async -> WeatherEntry {
        var lat = 47.978, lon = -4.084, fahrenheit = false, place = "Météo"
        var cfgJSON: [String: Any] = [:]
        if let (d, _) = try? await URLSession.shared.data(from: configURL),
           let j = try? JSONSerialization.jsonObject(with: d) as? [String: Any] {
            cfgJSON = j
            if let v = j["lat"] as? Double { lat = v }
            if let v = j["lon"] as? Double { lon = v }
            if let u = j["unit"] as? String, u == "F" { fahrenheit = true }
            if let n = j["name"] as? String, !n.trimmingCharacters(in: .whitespaces).isEmpty { place = n }
        }
        let u = "https://api.open-meteo.com/v1/forecast?latitude=\(lat)&longitude=\(lon)"
            + "&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_gusts_10m"
            + "&daily=weather_code,temperature_2m_max,temperature_2m_min"
            + "&timezone=auto&forecast_days=5"
            + (fahrenheit ? "&temperature_unit=fahrenheit" : "")
        guard let url = URL(string: u),
              let (d, _) = try? await URLSession.shared.data(from: url),
              let j = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
              let cur = j["current"] as? [String: Any],
              let daily = j["daily"] as? [String: Any],
              let dates = daily["time"] as? [String],
              let codes = daily["weather_code"] as? [Int],
              let tmax = daily["temperature_2m_max"] as? [Double],
              let tmin = daily["temperature_2m_min"] as? [Double]
        else { return .placeholder }

        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"
        let o = DateFormatter(); o.locale = Locale(identifier: "fr_FR"); o.dateFormat = "EEE"
        var days: [DayForecast] = []
        for i in 1..<min(dates.count, codes.count, tmax.count, tmin.count) {
            let lab = f.date(from: dates[i]).map { o.string(from: $0).replacingOccurrences(of: ".", with: "").capitalized } ?? "—"
            days.append(DayForecast(label: lab, code: codes[i], tmax: Int(tmax[i].rounded()), tmin: Int(tmin[i].rounded())))
        }
        let t = (cur["temperature_2m"] as? Double) ?? 0
        let code = (cur["weather_code"] as? Int) ?? 0
        let day = ((cur["is_day"] as? Int) ?? 1) == 1
        let tempC = fahrenheit ? (t - 32) / 1.8 : t
        let themes = cfgJSON["themes"] as? [String: Any] ?? [:]
        var key = themeKey(code: code, day: day, tempC: tempC, gust: (cur["wind_gusts_10m"] as? Double) ?? 0, wx: cfgJSON["wx"] as? [String: Any] ?? [:])
        if let force = cfgJSON["force"] as? String, force != "auto", themes[force] != nil { key = force }
        var bg: [Color] = [], hexes: [String] = [], ang = 170.0
        if let th = themes[key] as? [String: Any] {
            hexes = (th["c"] as? [String]) ?? []
            bg = hexes.compactMap(hexColor)
            if let a = th["ang"] as? Double { ang = a }
        }
        if bg.count < 2 { bg = colors(code, day: day); hexes = [] }
        let light = hexes.isEmpty ? false : (hexes.map(luminance).reduce(0, +) / Double(hexes.count)) > 0.68
        return WeatherEntry(
            date: Date(), place: place,
            temp: Int(t.rounded()),
            feels: Int(((cur["apparent_temperature"] as? Double) ?? 0).rounded()),
            code: code, isDay: day,
            unit: fahrenheit ? "°F" : "°", days: days,
            bg: bg, ang: ang, ink: light ? Color(red: 0.08, green: 0.12, blue: 0.2) : .white)
    }
}

// MARK: - Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WeatherEntry { .placeholder }
    func getSnapshot(in context: Context, completion: @escaping (WeatherEntry) -> Void) {
        if context.isPreview { completion(.placeholder); return }
        Task { completion(await Loader.load()) }
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<WeatherEntry>) -> Void) {
        Task {
            let e = await Loader.load()
            completion(Timeline(entries: [e], policy: .after(Date().addingTimeInterval(30 * 60))))
        }
    }
}

// MARK: - Vues

struct SmallView: View {
    let e: WeatherEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(e.place).font(.caption).fontWeight(.semibold).lineLimit(1)
            Spacer(minLength: 0)
            Image(systemName: symbol(e.code, day: e.isDay)).symbolRenderingMode(.multicolor).font(.title)
            Text("\(e.temp)\(e.unit)").font(.system(size: 40, weight: .light))
            Text(label(e.code)).font(.caption2).lineLimit(1)
        }
        .foregroundColor(e.ink)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

struct MediumView: View {
    let e: WeatherEntry
    var body: some View {
        HStack(spacing: 12) {
            SmallView(e: e)
            VStack(spacing: 6) {
                ForEach(e.days.prefix(4)) { d in
                    HStack {
                        Text(d.label).font(.caption).frame(width: 34, alignment: .leading)
                        Image(systemName: symbol(d.code, day: true)).symbolRenderingMode(.multicolor).frame(width: 22)
                        Spacer()
                        Text("\(d.tmax)°").font(.caption).fontWeight(.semibold)
                        Text("\(d.tmin)°").font(.caption).opacity(0.7).frame(width: 28, alignment: .trailing)
                    }
                }
            }
            .foregroundColor(e.ink)
            .frame(maxWidth: .infinity)
        }
    }
}

struct WidgetView: View {
    @Environment(\.widgetFamily) var family
    let e: WeatherEntry

    var body: some View {
        content.modifier(WidgetBG(colors: e.bg, ang: e.ang))
    }

    @ViewBuilder var content: some View {
        switch family {
        case .systemMedium: MediumView(e: e)
        case .accessoryRectangular:
            VStack(alignment: .leading) {
                Text("\(e.place) \(e.temp)\(e.unit)").font(.headline)
                Text(label(e.code)).font(.caption)
                if let d = e.days.first { Text("\(d.label) \(d.tmax)°/\(d.tmin)°").font(.caption2) }
            }
        case .accessoryCircular:
            VStack { Image(systemName: symbol(e.code, day: e.isDay)); Text("\(e.temp)°").font(.headline) }
        default: SmallView(e: e)
        }
    }
}

struct WidgetBG: ViewModifier {
    let colors: [Color]
    let ang: Double
    // Angle CSS (180 = de haut en bas) -> points de départ/arrivée
    var grad: LinearGradient {
        let r = ang * .pi / 180, dx = sin(r), dy = -cos(r)
        return LinearGradient(colors: colors,
            startPoint: UnitPoint(x: 0.5 - dx / 2, y: 0.5 - dy / 2),
            endPoint: UnitPoint(x: 0.5 + dx / 2, y: 0.5 + dy / 2))
    }
    func body(content: Content) -> some View {
        if #available(iOS 17.0, *) {
            content.containerBackground(for: .widget) { grad }
        } else {
            content.padding().background(grad)
        }
    }
}

@main
struct MeteoWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MeteoWidget", provider: Provider()) { e in
            WidgetView(e: e)
        }
        .configurationDisplayName("Météo")
        .description("Météo actuelle et prévisions, pour le lieu réglé dans l'admin.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryCircular])
    }
}
