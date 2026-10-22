// Il laboratorio della complessità in C++: ogni funzione esegue uno dei
// frammenti del capitolo "Laboratorio" e restituisce quante volte viene
// eseguita l'istruzione più interna (op++). Così si può controllare a mano
// che le formule siano giuste. Il sito fa lo stesso conteggio in JavaScript.
#include <iostream>
#include <string>
using namespace std;

typedef long long ll;

ll cicloSemplice(ll n) { ll op = 0; for (ll i = 0; i < n; i++) op++; return op; }

ll dueInSequenza(ll n) {
    ll op = 0;
    for (ll i = 0; i < n; i++) op++;
    for (ll j = 0; j < n; j++) op++;
    return op;
}

ll annidati(ll n) {
    ll op = 0;
    for (ll i = 0; i < n; i++)
        for (ll j = 0; j < n; j++) op++;
    return op;
}

ll triangolo(ll n) {
    ll op = 0;
    for (ll i = 0; i < n; i++)
        for (ll j = 0; j < i; j++) op++;
    return op;
}

ll passoTre(ll n) { ll op = 0; for (ll i = 0; i < n; i += 3) op++; return op; }

ll costante(ll n) {
    (void)n;                       // n non viene usato: il ciclo non dipende dall'input
    ll op = 0;
    for (ll i = 0; i < 1000; i++) op++;
    return op;
}

ll raddoppio(ll n) { ll op = 0; for (ll i = 1; i < n; i *= 2) op++; return op; }

ll nLogN(ll n) {
    ll op = 0;
    for (ll i = 0; i < n; i++)
        for (ll j = 1; j < n; j *= 2) op++;
    return op;
}

ll dimezzaEScorri(ll n) {
    ll op = 0;
    for (ll i = n; i > 0; i /= 2)
        for (ll j = 0; j < i; j++) op++;
    return op;
}

ll radice(ll n) { ll op = 0; for (ll i = 1; i * i <= n; i++) op++; return op; }

ll treCicli(ll n) {
    ll op = 0;
    for (ll i = 0; i < n; i++)
        for (ll j = 0; j < i; j++)
            for (ll k = 0; k < j; k++) op++;
    return op;
}

ll armonico(ll n) {
    ll op = 0;
    for (ll i = 1; i <= n; i++)
        for (ll j = 0; j < n; j += i) op++;
    return op;
}

ll quadratoDelPasso(ll n) { ll op = 0; for (ll i = 2; i < n; i = i * i) op++; return op; }

ll chiamate = 0;
ll f(ll n) {                       // ricorsione doppia: conta le chiamate
    chiamate++;
    if (n <= 1) return 1;
    return f(n - 1) + f(n - 2);
}
ll ricorsioneDoppia(ll n) { chiamate = 0; f(n); return chiamate; }

int main() {
    struct Prova { const char* nome; ll (*conta)(ll); };
    Prova prove[] = {
        {"ciclo semplice", cicloSemplice},  {"due in sequenza", dueInSequenza},
        {"annidati", annidati},             {"triangolo", triangolo},
        {"passo tre", passoTre},            {"costante", costante},
        {"raddoppio", raddoppio},           {"n log n", nLogN},
        {"dimezza e scorri", dimezzaEScorri}, {"radice", radice},
        {"tre cicli", treCicli},            {"armonico", armonico},
        {"quadrato del passo", quadratoDelPasso},
    };
    cout << "frammento            n=10      n=100     n=1000\n";
    for (const Prova& p : prove) {
        cout << p.nome;
        for (int k = 0; k < 20 - (int)string(p.nome).size(); k++) cout << ' ';
        for (ll n : {10LL, 100LL, 1000LL}) {
            cout.width(10);
            cout << p.conta(n);
        }
        cout << '\n';
    }
    cout << "ricorsione doppia   n=10: " << ricorsioneDoppia(10)
         << "  n=20: " << ricorsioneDoppia(20)
         << "  n=25: " << ricorsioneDoppia(25) << '\n';
    return 0;
}
