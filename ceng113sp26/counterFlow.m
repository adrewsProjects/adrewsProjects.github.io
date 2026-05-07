% Isothermal
T0 = 298; % K
P0 = 400; % kPa
v0 = 3; % L/s
nA0 = P0*v0/(8.314*T0); % 8.314 L-kPa/(mol-K)
Vmax = 0.25*pi*(10/100)^2*3.5*1000; % m3 -> L
T0 = 298; % K
 % 20 -> 272
 % 30 -> 282.5
 % 31 -> 283.5
 % 30.5 -> 283.004
TuGuess = 30.5 + 273; % K
Y0 = [nA0; 0; P0; T0; TuGuess]; % [nA; nB; P], [mol/s mol/s kPa]
[V, Y] = ode45(@myODE, [0 Vmax], Y0);
disp(Y(end, end)); % should be 10+273 = 283 K



function dYdV = myODE(V, Y)
nA = Y(1); % mol/s
nB = Y(2); % mol/s
P = Y(3); % kPa
T = Y(4); % K
Tu = Y(5); % K

k = 0.2*exp(15000/8.314*(1/320-1/T)); % (3.10)
nT = nA+nB; % mol/s

R = 8.314; % L-kPa/mol-K
% T = 298; % K
P = 400; % kPa
v = nT*R*T/P; % IGL: nT*R*T/P, or (5.5)

r = k*nA/v; % mol/L-s, elementary
dnAdV = -r; % mol/L-s, (7.1)
dnBdV = r; % mol/L-s, (7.1)

% Energy balances
dH = -10*1e3; % J/mol (needs T adjustment)
deltaQ = (1/1500+1/60)^(-1)*40*(Tu - T); % J/s-m3
dTdV = (deltaQ/1000 - r*dH)/(nA*30 + nB*40);
dTudV = deltaQ/(3*75)/1000; % K/m3 -> K/L


% Pressure drop
d = 0.1; % m
mT = 32.6*(nA + nB)/1000; % g/s -> kg/s
Re = 4*mT/(pi * d * 1e-5); % unitless
f = 0.0791*Re.^(-0.25); % unitless
dPdV = -v*f*128*mT./(pi^3 * d.^7)/1000/1000/1000; % kPa/L 


dYdV = [dnAdV; dnBdV; dPdV; dTdV; dTudV]; % mol/L-s
end