k = 0.125; % 1/s
v0 = 0.5; % L/s
nA0 = 3; % mol/s
Vmax = 12; % L

[Vsol, nAsol] = ode45(@myODE, [0 12], nA0);

fplot(@(V) nA0*exp(-k*V/v0), [0 12]);
hold on
plot([0 2 4 5 6], [3 1.5 0.75 0.5625 0.4219], 'k-o', 'MarkerFaceColor', 'k');
plot(Vsol, nAsol, 'ro', 'MarkerFaceColor', 'r');
hold off

function dnAdV = myODE(V, nA)
dnAdV = -0.125*nA/0.5; % mol/L-s
end