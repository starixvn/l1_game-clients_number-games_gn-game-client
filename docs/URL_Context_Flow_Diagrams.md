# URL Context Flow Diagrams

## 1. Complete First Login to Lobby Flow

```mermaid
flowchart TD
    A1[User accesses application] --> B1[URL Context Parsing]
    B1 --> C1{URL Parameters Present?}
    C1 -->|Yes| D1[Parse gameId, isDirectMode, redirectUrl, isSabaPlay]
    C1 -->|No| E1[Load from localStorage]

    D1 --> F1[Store in localStorage]
    E1 --> F1
    F1 --> G1[Clear URL parameters]
    G1 --> H1[SplashScreen Initialization]

    H1 --> I1[Get Session]
    I1 --> J1{Session Valid?}
    J1 -->|No| K1[Redirect to Timeout]
    J1 -->|Yes| L1{UM Session?}

    L1 -->|Yes| M1[Render UM Page]
    L1 -->|No| N1[Authorize User]

    N1 --> O1{User Authorized?}
    O1 -->|No| P1{isDirectMode or isSabaPlay?}
    O1 -->|Yes| Q1[Load Lobby Configs]

    P1 -->|Yes| R1[Auto Create Nickname]
    P1 -->|No| S1[Render Register]

    R1 --> T1{Success?}
    T1 -->|No| K1
    T1 -->|Yes| Q1

    Q1 --> U1{isDirectMode?}
    U1 -->|Yes| V1[Use URL gameId]
    U1 -->|No| W1[Apply SSO Redirect Logic]

    W1 --> X1{firstSSOToLobby?}
    X1 -->|Yes| Y1[Set gameId equals 0 Lobby]
    X1 -->|No| Z1[Use latestGameId and Check Service]

    V1 --> AA1[Set currentGameId]
    Y1 --> AA1
    Z1 --> AA1

    AA1 --> BB1[Custom Startup]
    BB1 --> CC1[Preload Resources]
    CC1 --> DD1[Render Dashboard]

    S1 --> EE1[User Registration]
    EE1 --> FF1[Submit Form]
    FF1 --> GG1{isDirectMode?}
    GG1 -->|Yes| HH1[Keep Original gameId]
    GG1 -->|No| II1[Update toLoadGameId]

    II1 --> JJ1{firstSSOToLobby?}
    JJ1 -->|Yes| KK1[Set toLoadGameId equals 0]
    JJ1 -->|No| LL1[Find Available Game]

    HH1 --> MM1[Trigger Preload]
    KK1 --> MM1
    LL1 --> MM1

    MM1 --> CC1
    CC1 --> DD1
```

## 2. URL Context Parameter Decision Tree

```mermaid
flowchart TD
    A2[URL Parameters] --> B2{ref parameter?}
    B2 -->|Yes| C2[isDirectMode is true]
    B2 -->|No| D2[isDirectMode is false]

    C2 --> E2{gameId parameter?}
    E2 -->|Yes| F2[Use gameId directly]
    E2 -->|No| G2[gameId equals 0 lobby]

    D2 --> H2{gameId parameter?}
    H2 -->|Yes| I2[Apply SSO logic]
    H2 -->|No| J2[gameId equals 0 lobby]

    I2 --> K2{firstSSOToLobby?}
    K2 -->|Yes| L2[Set gameId equals 0 lobby]
    K2 -->|No| M2[Use latestGameId]

    M2 --> N2{Service Available?}
    N2 -->|Yes| O2[Keep gameId]
    N2 -->|No| P2[Find Available Game]

    A2 --> Q2{op parameter?}
    Q2 -->|SP| R2[isSabaPlay is true]
    Q2 -->|Other or None| S2[isSabaPlay is false]

    R2 --> T2[Trigger Auto Nickname]
    S2 --> U2[Normal Registration]

    A2 --> V2{rurl parameter?}
    V2 -->|Present| W2[redirectUrl equals rurl]
    V2 -->|Not Present| X2[redirectUrl is empty string]

    W2 --> Y2{isDirectMode?}
    Y2 -->|Yes| Z2[Store redirectUrl]
    Y2 -->|No| AA2[redirectUrl is empty string]
```

## 3. Registration Flow Decision Matrix

```mermaid
flowchart TD
    A3[Register Component] --> B3[Initialize State]
    B3 --> C3[Set toLoadGameId equals gameId from props]
    C3 --> D3[User Fills Form]
    D3 --> E3[Submit Registration]
    E3 --> F3{Name Valid?}
    F3 -->|No| G3[Show Error]
    F3 -->|Yes| H3[Create Nickname]

    H3 --> I3{Success?}
    I3 -->|No| G3
    I3 -->|Yes| J3{isDirectMode?}

    J3 -->|Yes| K3[Keep Original gameId]
    J3 -->|No| L3[Call updateToLoadGameId]

    L3 --> M3[Get Lobby Configs]
    M3 --> N3{firstSSOToLobby?}
    N3 -->|Yes| O3[Set toLoadGameId equals 0]
    N3 -->|No| P3[Find Available Game Service]

    P3 --> Q3{Service Available?}
    Q3 -->|Yes| R3[Set toLoadGameId equals Available Game]
    Q3 -->|No| S3[Keep Current toLoadGameId]

    K3 --> T3[Trigger Preload Resources]
    O3 --> T3
    R3 --> T3
    S3 --> T3

    T3 --> U3{toLoadGameId equals 0?}
    U3 -->|Yes| V3[Skip Preload, Render Dashboard]
    U3 -->|No| W3[Preload Resources]

    W3 --> X3[Render Dashboard]
    V3 --> X3
```

## 4. Dashboard Rendering Logic Flow

```mermaid
flowchart TD
    A4[Dashboard Constructor] --> B4[Initialize with queryGame]
    B4 --> C4[componentDidMount]
    C4 --> D4{queryGame greater than 0?}
    D4 -->|Yes| E4[openGame queryGame]
    D4 -->|No| F4[Render Lobby]

    E4 --> G4[Set State: queryGame, openGameId]
    G4 --> H4[Update URL Context]
    H4 --> I4[shouldRenderGames Check]

    I4 --> J4{openGameId greater than 0 and offerGames includes?}
    J4 -->|Yes| K4[Render Games]
    J4 -->|No| L4[Render Lobby]

    F4 --> M4[Update URL Context: backToLobby]
    M4 --> L4

    L4 --> N4[Lobby Component]
    N4 --> O4[User Clicks Game]
    O4 --> P4[openGameFromLobby]
    P4 --> Q4{GameId Different?}
    Q4 -->|Yes| R4[Remove Game Transmitter]
    Q4 -->|No| S4[Force Update]

    R4 --> T4[Set openGameId]
    S4 --> T4
    T4 --> U4[Update URL Context]
    U4 --> I4
```

## 5. URL Context State Management Flow

```mermaid
flowchart TD
    A5[URL Context Update] --> B5[updateURLContext]
    B5 --> C5[Get Context from localStorage]
    C5 --> D5{gameId Present?}
    D5 -->|Yes| E5[Update latestGameId]
    D5 -->|No| F5[Skip gameId Update]

    E5 --> G5[Store in localStorage]
    F5 --> G5
    G5 --> H5[Set firstSSOToLobby equals false]
    H5 --> I5[Store Updated Context]

    A5 --> J5[Load URL Context]
    J5 --> K5[loadURLContext]
    K5 --> L5{Context from URL?}
    L5 -->|Yes| M5[Parse URL Parameters]
    L5 -->|No| N5[Load from localStorage]

    M5 --> O5[Store in localStorage]
    N5 --> O5
    O5 --> P5[Clear URL Parameters]
    P5 --> Q5[Return Context]
```

## 6. Service Availability Check Flow

```mermaid
flowchart TD
    A6[Service Availability Check] --> B6[Get Enabled Game Settings]
    B6 --> C6{firstSSOToLobby?}
    C6 -->|Yes| D6[Set gameId equals 0 Lobby]
    C6 -->|No| E6{latestGameId greater than 0?}

    E6 -->|No| F6[Find First Available Game]
    E6 -->|Yes| G6[Check latestGameId Service]

    G6 --> H6{Service Available?}
    H6 -->|Yes| I6[Use latestGameId]
    H6 -->|No| F6

    F6 --> J6[Iterate Game Settings]
    J6 --> K6{Service Available?}
    K6 -->|Yes| L6[Set to Available Game]
    K6 -->|No| M6{More Games?}

    M6 -->|Yes| J6
    M6 -->|No| N6[Set gameId equals 0 Lobby]

    D6 --> O6[Return gameId]
    I6 --> O6
    L6 --> O6
    N6 --> O6
```

## 7. Auto Nickname Creation Flow

```mermaid
flowchart TD
    A7[Auto Nickname Creation] --> B7{isDirectMode or isSabaPlay?}
    B7 -->|Yes| C7[Generate Random Name]
    B7 -->|No| D7[Show Registration Form]

    C7 --> E7[Generate Random Avatar]
    E7 --> F7[Call createNickname API]
    F7 --> G7{Success?}
    G7 -->|No| H7[Sign Out]
    G7 -->|Yes| I7[Set User Settings]

    I7 --> J7[Update Sign In Status]
    J7 --> K7[Continue to Game or Lobby]

    D7 --> L7[User Fills Form]
    L7 --> M7[Submit Registration]
    M7 --> N7{Success?}
    N7 -->|No| O7[Show Error]
    N7 -->|Yes| K7

    O7 --> L7
```

## 8. Back to Lobby Flow

```mermaid
flowchart TD
    A8[Back to Lobby Action] --> B8{redirectUrl Present?}
    B8 -->|Yes| C8[Decode redirectUrl]
    B8 -->|No| D8[Update URL Context]

    C8 --> E8[Redirect to Decoded URL]
    D8 --> F8[Set gameId equals 0]
    F8 --> G8[Set backToLobby equals true]
    G8 --> H8[Broadcast BACK_TO_LOBBY]

    H8 --> I8[Dashboard resetGameIdDashboardEvent]
    I8 --> J8[Set openGameId equals 0]
    J8 --> K8[Force Update]
    K8 --> L8[Render Lobby]
```

## 9. Analytics Tracking Flow

```mermaid
flowchart TD
    A9[Analytics Login] --> B9[Get URL Context]
    B9 --> C9{isDirectMode?}
    C9 -->|Yes| D9[ssoMethod is SSO_Direct_Mode_To_Game]
    C9 -->|No| E9{gameId greater than 0?}

    E9 -->|Yes| F9[ssoMethod is SSO_To_Game]
    E9 -->|No| G9[ssoMethod is SSO_To_Lobby]

    D9 --> H9[Set Analytics Context]
    F9 --> H9
    G9 --> H9

    H9 --> I9[Track gameId]
    I9 --> J9[Track language]
    J9 --> K9[Track gameName if gameId greater than 0]
```

## 10. Error Handling Flow

```mermaid
flowchart TD
    A10[Error Handling] --> B10{Error Type?}
    B10 -->|Invalid gameId| C10[Set gameId equals 0]
    B10 -->|Service Unavailable| D10[Find Alternative Game]
    B10 -->|Authorization Failure| E10[Redirect to Timeout]
    B10 -->|Network Error| F10[Retry with Backoff]

    C10 --> G10[Log Error]
    D10 --> H10{Alternative Found?}
    H10 -->|Yes| I10[Use Alternative Game]
    H10 -->|No| C10

    E10 --> J10[Clear Session]
    F10 --> K10{Max Retries?}
    K10 -->|No| L10[Retry Request]
    K10 -->|Yes| M10[Show Error Message]

    G10 --> N10[Continue Flow]
    I10 --> N10
    J10 --> O10[End Session]
    L10 --> F10
    M10 --> P10[User Action Required]
```

These diagrams provide a comprehensive visual representation of how the URL context parameters interact throughout the first login to lobby flow, helping developers understand the complex decision-making logic and state management involved in the application.
